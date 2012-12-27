#!/bin/sh

# checks to see if there are any console.logs out there.
FILES_PATTERN='\.(js|coffee)(\..+)?$'
FORBIDDEN='console.log'
git diff --cached --name-only | \
    grep -E $FILES_PATTERN | \
    GREP_COLOR='37;41' xargs grep --color --with-filename -n $FORBIDDEN && echo 'COMMIT REJECTED Found "$FORBIDDEN" references. Please remove them before commiting' && exit 1
echo '**********Passed config.log() test'
# makes sure that code that isn't part of the current commit gets stashed
git stash -q --keep-index
./run_tests.sh
RESULT=$?
# pops the code that was stashed
git stash pop -q
[ $RESULT -ne 0 ] && exit 1
exit 0