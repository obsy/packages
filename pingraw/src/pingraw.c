/*
    pingraw

    Copyright (C) 2025 Cezary Jackiewicz <cezary@eko.one.pl>

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

void* ping_thread(void *arg) {
    PingResult *result = (PingResult *)arg;
    struct addrinfo hints, *res;
    int sock;
    struct timespec start, end;

    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_INET;

    if (getaddrinfo(result->host, NULL, &hints, &res) != 0) {
        result->status = STATUS_FAILED;
        return NULL;
    }

    if ((sock = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP)) < 0) {
        result->status = STATUS_FAILED;
        freeaddrinfo(res);
        return NULL;
    }

    struct timeval tv = {TIMEOUT_MS / 1000, (TIMEOUT_MS % 1000) * 1000};
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

    struct icmphdr packet;
    memset(&packet, 0, sizeof(packet));
    packet.type = ICMP_ECHO;
    packet.code = 0;
    packet.un.echo.id = getpid() & 0xFFFF;
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
        int bytes = recvfrom(sock, recv_buf, sizeof(recv_buf), 0,
                            (struct sockaddr *)&from, &from_len);

        if (bytes <= 0) {
            result->status = STATUS_TIMEOUT;
            break;
        }

        // source
        if (from.sin_addr.s_addr != addr->sin_addr.s_addr) {
            continue;
        }

        // IP header
        struct iphdr *ip_header = (struct iphdr *)recv_buf;
        int header_len = ip_header->ihl * 4;

        if (bytes < header_len + (int)sizeof(struct icmphdr)) {
            result->status = STATUS_INVALID_RESPONSE;
            break;
        }

        struct icmphdr *icmp_response = (struct icmphdr *)(recv_buf + header_len);

        // ID & type
        if (icmp_response->type == ICMP_ECHOREPLY &&
            icmp_response->un.echo.id == packet.un.echo.id) {
            clock_gettime(CLOCK_MONOTONIC, &end);
            result->time = (end.tv_sec - start.tv_sec) * 1000.0 +
                          (end.tv_nsec - start.tv_nsec) / 1000000.0;
            result->status = STATUS_SUCCESS;
            received = 1;
        }
        else if (icmp_response->type == ICMP_DEST_UNREACH) {
            result->status = STATUS_UNREACHABLE;
            break;
        }
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

    for (int i = 0; i < num_hosts; i++) {
        strncpy(results[i].host, argv[i+1], sizeof(results[i].host)-1);
        results[i].host[sizeof(results[i].host)-1] = '\0';
        results[i].time = -1;
        results[i].status = -1;
        pthread_create(&threads[i], NULL, ping_thread, &results[i]);
    }

    for (int i = 0; i < num_hosts; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("[\n");
    for (int i = 0; i < num_hosts; i++) {
        printf(" {\n");
        printf("  \"host\": \"%s\",\n", results[i].host);
        printf("  \"status\": \"");
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
            printf(",\n  \"time_ms\": %.3f", results[i].time);
        }
        printf("\n }%s\n", (i < num_hosts-1) ? "," : "");
    }
    printf("]\n");

    return 0;
}
