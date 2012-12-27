#!/bin/sh

txtrst=$(tput sgr0) # Text reset
txtred=$(tput setaf 1) # Red
txtgrn=$(tput setaf 2) # Green
txtylw=$(tput setaf 3) # Yellow
txtblu=$(tput setaf 4) # Blue
txtpur=$(tput setaf 5) # Purple
txtcyn=$(tput setaf 6) # Cyan
txtwht=$(tput setaf 7) # White
txtbold=$(tput bold)
txtso=$(tput smso)

echo "\n${txtylw}${txtbold}=============================="
echo "***Running LULZ Tests OMFG!***"
echo "==============================${txtrst}"
echo '\n\t(1) Checking those javascripts:'
# checks to see if there are any console.logs out there.
FILES_PATTERN='\.(js|coffee)(\..+)?$'
FORBIDDEN='console.log'
if git diff --cached --name-only | grep -E $FILES_PATTERN 
then
	echo "\t\tWe has the js!!\n"
	git diff --cached --name-only | \
	    grep -E $FILES_PATTERN | \
	    GREP_COLOR='37;41' xargs grep --color --with-filename -n $FORBIDDEN && echo '\t\tCOMMIT REJECTED Found "$FORBIDDEN" references. Please remove them before commiting' && exit 1
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
	echo "\t\tYou has no javascripts to be committed!!"
fi

echo "\n\t${txtgrn}${txtbold}You javascripts has make pass test!!${txtrst}"


# makes sure that code that ch isn't part of the current commit gets stashed
# git stash -q --keep-index
# ./run_tests.sh
# RESULT=$?
# pops the code that was stashed
# git stash pop -q
# [ $RESULT -ne 0 ] && exit 1

exit 0