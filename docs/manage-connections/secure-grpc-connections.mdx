---
id: secure-grpc
title: Secure gRPC connections
sidebar_label: Secure gRPC connections
---

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget />

This document will help advanced users create and configure TLS certificates to allow for secure gRPC connections to their beacon nodes.

:::tip Pro-Tip

The only practical use for using secure gRPC is in the case of connecting a beacon node that is being hosted remotely. For configurations in which the beacon node and validator reside on the same host system, these steps are not required nor recommended.

:::

A beacon node, by default, hosts a gRPC server on host `127.0.0.1` and port 4000, allowing any other process, such as a validator client, to establish an insecure connection on that port. The beacon node can also allow for secure, TLS connections if ran with the `--tls-cert=/path/to/cert.pem` and `--tls-key=/path/to/cert.key` flags, ensuring all connections via gRPC are secured. 

A validator client will attempt to connect to a beacon node by default with an insecure connection, but can be a secure TLS connection by using a `--tls-cert=/path/to/cert.pem` flag, utilising either a server pem certificate or a `ca.cert` certificate authority file. Assuming a TLS certificate has already been set up with a trusted authority for your beacon node, use the commands below to launch the node and validator. Otherwise, review the following section on creating your own self-signed certificates.

To use secure gRPC with a beacon node:

```sh
./prysm.sh beacon-node --tls-cert=server.pem --tls-key=server.key
```

and to use secure gRPC with a validator:

```sh
./prysm.sh validator --tls-cert=server.pem
```

Alternatively, a `ca.cert` certificate authority file can be passed to the validator to attempt a connection without requiring the server's certificate itself:
 
```sh
./prysm.sh validator --tls-cert=ca.cert
```

This will generate an output like so:

```sh
[2020-06-15 17:09:13]  INFO validator: Established secure gRPC connection
```

## Generating self-signed TLS certificates

:::caution 

Creating a self-signed certificate is fine for simple TLS connections, though if the deployment will see public usage, it is always recommended to obtain valid certificates from a trusted certificate authority instead.

:::

1. Install [openssl](https://www.openssl.org/) for your operating system. 

2. Create a root signing key:

    ```sh
    openssl genrsa -out ca.key 4096
    ```

3. Create a self-signed root certificate:

    ```sh
    openssl req -new -x509 -key ca.key -sha256 -subj "/C=US/ST=NJ/O=CA, Inc." -days 365 -out ca.cert
    ```

4. Create a key certificate for the beacon node:

    ```sh
    openssl genrsa -out beacon.key 4096
    ```

5. Generate a signing CSR by first creating a  `certificate.conf` configuration file containing the specifications. For reference, you can use something as follows with any of its fields customized to your needs:

    ```sh
    [req]
    default_bits = 4096
    prompt = no
    default_md = sha256
    req_extensions = req_ext
    distinguished_name = dn
    [dn]
    C = US
    ST = NJ
    O = Test, Inc.
    CN = localhost
    [req_ext]
    subjectAltName = @alt_names
    [alt_names]
    DNS.1 = localhost
    IP.1 = ::1
    IP.2 = 127.0.0.1
    ```

6. Generate the signing CSR:
    ```sh
    openssl req -new -key beacon.key -out beacon.csr -config certificate.conf
    ```

7. Generate a certificate for the beacon node:

    ```sh
    openssl x509 -req -in beacon.csr -CA ca.cert -CAkey ca.key -CAcreateserial -out beacon.pem -days 365 -sha256 -extfile certificate.conf -extensions req_ext
    ```

8. Verify your certificate is correct with openssl:

    ```sh
    openssl x509 -in beacon.pem -text -noout
    ```

    This will generate an output like so:

    ```sh
    Certificate:
        Data:
            Version: 3 (0x2)
            Serial Number: 12510557889986420634 (0xad9e6e1dfe99df9a)
        Signature Algorithm: sha256WithRSAEncryption
            Issuer: C=US, ST=NJ, O=CA, Inc.
            Validity
                Not Before: Jun 15 21:12:24 2020 GMT
                Not After : Jun 15 21:12:24 2021 GMT
            Subject: C=US, ST=NJ, O=Test, Inc., CN=localhost
            Subject Public Key Info:
                Public Key Algorithm: rsaEncryption
                    Public-Key: (4096 bit)
    ```

### Using the new certificates

1. Use the certificates to launch the beacon node:

    ```sh
    ./prysm.sh beacon-node --tls-cert=beacon.pem --tls-key=beacon.key
    ```

2. As well as a validator:

    ```sh
    ./prysm.sh validator --tls-cert=ca.cert
    ```

    This will generate an output like so: 

    ```sh
    [2020-06-15 17:09:13]  INFO validator: Established secure gRPC connection
    ```

