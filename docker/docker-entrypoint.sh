#!/bin/bash

TARGET_UID=$(stat -c "%u" .)
TARGET_GID=$(stat -c "%g" .)

UID_EXISTS=$(cat /etc/passwd | grep $TARGET_UID | wc -l)
GID_EXISTS=$(cat /etc/group | grep $TARGET_GID | wc -l)

# Create new group using target GID and add nobody user
if [ $GID_EXISTS == "0" ]; then
  groupadd -g $TARGET_GID tempgroup
  usermod -a -G tempgroup nobody
else
  # GID exists, find group name and add
  GROUP=$(getent group $TARGET_GID | cut -d: -f1)
  usermod -a -G $GROUP nobody
fi

# Create new user using target UID
if [ $UID_EXISTS == "0" ]; then
  useradd -m -g $TARGET_GID -u $TARGET_UID tempuser
fi

if [ $1 == "npm" ]; then
  gosu $TARGET_UID npm install .
  gosu $TARGET_UID "$@"
else
  exec "$@"
fi
