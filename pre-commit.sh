#!/bin/sh

# checks to see if there are any console.logs out there.
FILES_PATTERN='\.(js|coffee)(\..+)?$'
FORBIDDEN='console.log'

if git diff --cached --name-only | grep -E $FILES_PATTERN 
then
	echo "we have js"
	git diff --cached --name-only | \
	    grep -E $FILES_PATTERN | \
	    GREP_COLOR='37;41' xargs grep --color --with-filename -n $FORBIDDEN && echo 'COMMIT REJECTED Found "$FORBIDDEN" references. Please remove them before commiting' && exit 1
	echo '**********Passed config.log() test'
	# run grunt lint check
	cd build/10k/ && grunt lint
	RESULT=$?
	[ $RESULT -ne 0 ] && exit 1
	#beautify js
	grunt jsbeautifier
	RESULT=$?
	[ $RESULT -ne 0 ] && exit 1
	cd ../../
else
	echo "no js to be committed"
fi

# makes sure that code that ch isn't part of the current commit gets stashed
# git stash -q --keep-index
./run_tests.sh
RESULT=$?
# pops the code that was stashed
# git stash pop -q
[ $RESULT -ne 0 ] && exit 1
exit 0