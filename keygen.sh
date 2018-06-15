
#!/usr/bin/env bash
KNAME="${MANAGERIST_JWT_KEY-jwtRS256.gen}"
ODIR="dist/secured"
mkdir "${ODIR}"
# generate rsa-key pairs
ssh-keygen -t rsa -b 2048 -f "${ODIR}/${KNAME}.key" -q -N ""
# format pub
openssl rsa -in "${ODIR}/${KNAME}.key" -pubout -outform PEM -out "${ODIR}/${KNAME}.key.pub"