/*
    pingraw

    Copyright (C) 2025-2026 Cezary Jackiewicz <cezary@eko.one.pl>

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
    MA 02110-1301 USA.
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <time.h>
#include <unistd.h>
#include <pthread.h>
#include <netinet/ip.h>
#include <sys/time.h>
#include <netinet/ip_icmp.h>

#define PACKET_SIZE 64
#define TIMEOUT_MS 1000
#define MAX_HOSTS 20

#define STATUS_SUCCESS 0
#define STATUS_TIMEOUT 1
#define STATUS_FAILED 2
#define STATUS_UNREACHABLE 3
#define STATUS_INVALID_RESPONSE 4

typedef struct {
    char host[256];
    double time;
    int status;
    int index; /* used to derive a unique ICMP id per thread */
} PingResult;

unsigned short checksum(void *b, int len) {
    unsigned short *buf = b;
    unsigned int sum = 0;
    for (; len > 1; len -= 2)
        sum += *buf++;
    if (len == 1)
        sum += *(unsigned char *)buf;
    sum = (sum >> 16) + (sum & 0xFFFF);
    sum += (sum >> 16);
    return ~sum;
}

/* Returns elapsed milliseconds between two timespecs */
static double elapsed_ms(struct timespec *start, struct timespec *now) {
    return (now->tv_sec - start->tv_sec) * 1000.0 +
           (now->tv_nsec - start->tv_nsec) / 1000000.0;
}

/* Escapes a string for safe inclusion inside a JSON string literal and
 * prints it (without surrounding quotes) to stdout. Handles the characters
 * required by the JSON spec: quote, backslash, and control characters. */
static void print_json_escaped(const char *s) {
    for (const unsigned char *p = (const unsigned char *)s; *p; p++) {
        switch (*p) {
            case '"':  fputs("\\\"", stdout); break;
            case '\\': fputs("\\\\", stdout); break;
            case '\b': fputs("\\b", stdout);  break;
            case '\f': fputs("\\f", stdout);  break;
            case '\n': fputs("\\n", stdout);  break;
            case '\r': fputs("\\r", stdout);  break;
            case '\t': fputs("\\t", stdout);  break;
            default:
                if (*p < 0x20) {
                    printf("\\u%04x", *p);
                } else {
                    fputc(*p, stdout);
                }
        }
    }
}

void* ping_thread(void *arg) {
    PingResult *result = (PingResult *)arg;
    struct addrinfo hints, *res;
    int sock;
    struct timespec start, now;

    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_RAW;

    if (getaddrinfo(result->host, NULL, &hints, &res) != 0) {
        result->status = STATUS_FAILED;
        return NULL;
    }

    if ((sock = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP)) < 0) {
        result->status = STATUS_FAILED;
        freeaddrinfo(res);
        return NULL;
    }

    /* Per-recvfrom timeout; total time budget is enforced separately below,
     * since a stream of unrelated ICMP traffic could otherwise keep
     * resetting this per-call timeout indefinitely. */
    struct timeval tv = {TIMEOUT_MS / 1000, (TIMEOUT_MS % 1000) * 1000};
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

    struct icmphdr packet;
    memset(&packet, 0, sizeof(packet));
    packet.type = ICMP_ECHO;
    packet.code = 0;
    /* Unique id per thread so replies can't be mixed up when the same host
     * is passed more than once on the command line. */
    packet.un.echo.id = (getpid() ^ (result->index << 8)) & 0xFFFF;
    packet.un.echo.sequence = 0;
    packet.checksum = checksum(&packet, sizeof(packet));

    struct sockaddr_in *addr = (struct sockaddr_in *)res->ai_addr;
    clock_gettime(CLOCK_MONOTONIC, &start);

    if (sendto(sock, &packet, sizeof(packet), 0,
              (struct sockaddr *)addr, sizeof(*addr)) <= 0) {
        result->status = STATUS_FAILED;
        close(sock);
        freeaddrinfo(res);
        return NULL;
    }

    char recv_buf[PACKET_SIZE + 128];
    struct sockaddr_in from;
    socklen_t from_len = sizeof(from);
    int received = 0;

    while (!received) {
        /* Enforce a total time budget across all recvfrom retries, not
         * just a per-call timeout. */
        clock_gettime(CLOCK_MONOTONIC, &now);
        double spent = elapsed_ms(&start, &now);
        if (spent >= TIMEOUT_MS) {
            result->status = STATUS_TIMEOUT;
            break;
        }

        double remaining_ms = TIMEOUT_MS - spent;
        struct timeval rtv = {(long)(remaining_ms / 1000),
                               (long)((remaining_ms - (long)(remaining_ms / 1000) * 1000) * 1000)};
        setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &rtv, sizeof(rtv));

        int bytes = recvfrom(sock, recv_buf, sizeof(recv_buf), 0,
                            (struct sockaddr *)&from, &from_len);

        if (bytes <= 0) {
            result->status = STATUS_TIMEOUT;
            break;
        }

        /* source */
        if (from.sin_addr.s_addr != addr->sin_addr.s_addr) {
            continue;
        }

        /* Need at least a full IP header before reading ihl */
        if (bytes < (int)sizeof(struct iphdr)) {
            result->status = STATUS_INVALID_RESPONSE;
            break;
        }

        struct iphdr *ip_header = (struct iphdr *)recv_buf;
        int header_len = ip_header->ihl * 4;

        if (header_len < (int)sizeof(struct iphdr) ||
            bytes < header_len + (int)sizeof(struct icmphdr)) {
            result->status = STATUS_INVALID_RESPONSE;
            break;
        }

        struct icmphdr *icmp_response = (struct icmphdr *)(recv_buf + header_len);

        /* ID & type */
        if (icmp_response->type == ICMP_ECHOREPLY &&
            icmp_response->un.echo.id == packet.un.echo.id) {
            clock_gettime(CLOCK_MONOTONIC, &now);
            result->time = elapsed_ms(&start, &now);
            result->status = STATUS_SUCCESS;
            received = 1;
        }
        else if (icmp_response->type == ICMP_DEST_UNREACH) {
            result->status = STATUS_UNREACHABLE;
            break;
        }
        /* else: unrelated ICMP traffic; loop and try again within budget */
    }

    close(sock);
    freeaddrinfo(res);
    return NULL;
}

int main(int argc, char *argv[]) {
    if (argc < 2 || argc-1 > MAX_HOSTS) {
        fprintf(stderr, "Usage: %s <host1> <host2>... (max %d hosts)\n",
               argv[0], MAX_HOSTS);
        return 1;
    }

    int num_hosts = argc - 1;
    PingResult results[num_hosts];
    pthread_t threads[num_hosts];
    int created[num_hosts];

    for (int i = 0; i < num_hosts; i++) {
        strncpy(results[i].host, argv[i+1], sizeof(results[i].host)-1);
        results[i].host[sizeof(results[i].host)-1] = '\0';
        results[i].time = -1;
        results[i].status = -1;
        results[i].index = i;
        created[i] = 0;

        int rc = pthread_create(&threads[i], NULL, ping_thread, &results[i]);
        if (rc != 0) {
            fprintf(stderr, "Warning: could not start thread for host '%s': %s\n",
                    results[i].host, strerror(rc));
            results[i].status = STATUS_FAILED;
        } else {
            created[i] = 1;
        }
    }

    for (int i = 0; i < num_hosts; i++) {
        if (created[i]) {
            pthread_join(threads[i], NULL);
        }
    }

    printf("[");
    for (int i = 0; i < num_hosts; i++) {
        printf("{");
        printf("\"host\":\"");
        print_json_escaped(results[i].host);
        printf("\",");
        printf("\"status\":\"");
        switch(results[i].status) {
            case STATUS_SUCCESS: printf("success"); break;
            case STATUS_TIMEOUT: printf("timeout"); break;
            case STATUS_FAILED: printf("failed"); break;
            case STATUS_UNREACHABLE: printf("unreachable"); break;
            case STATUS_INVALID_RESPONSE: printf("invalid_response"); break;
            default: printf("unknown");
        }
        printf("\"");

        if (results[i].status == STATUS_SUCCESS) {
            printf(",\"time_ms\":%.3f", results[i].time);
        }
        printf("}%s", (i < num_hosts-1) ? "," : "");
    }
    printf("]");

    return 0;
}
