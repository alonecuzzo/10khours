#!/bin/bash

# makes sure that code that isn't part of the current commit gets stashed
git stash -q --keep-index
./run_tests.sh
RESULT=$?
# pops the code that was stashed
git stash pop -q
[ $RESULT -ne 0 ] && exit 1
exit 0