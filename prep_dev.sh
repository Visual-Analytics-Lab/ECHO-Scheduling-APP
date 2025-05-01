#! /bin/bash

meteor build --architecture os.linux.x86_64 ../build
rm -r ../build/ESS.tar.gz
mv ../build/ECHO-Scheduling-APP.tar.gz ../build/ESS.tar.gz
# Change username to yours
scp -r ../build/ESS.tar.gz zfk4@essdev.msussrc.com:/home/admin