#
#   DIST.sh
#
#   David Janes
#   IOTDB
#   YYYY-MM-DD
#

exit 0
PACKAGE=homestar-TEMPLATE
DIST_ROOT=/var/tmp/.dist.$$

if [ ! -d "$DIST_ROOT" ]
then
    mkdir "$DIST_ROOT"
fi

echo "=================="
echo "NPM Packge: $PACKAGE"
echo "=================="
(
    NPM_DST="$DIST_ROOT/$PACKAGE"
    echo "NPM_DST=$NPM_DST"

    if [ -d ${NPM_DST} ]
    then
        rm -rf "${NPM_DST}"
    fi
    mkdir "${NPM_DST}" || exit 1

    update-package --increment-version --package "$PACKAGE" --homestar || exit 1

    tar cf - \
        --exclude "node_modules" \
        README.md LICENSE \
        package.json index.js \
        grammar.js \
        db.js db_*.js \
        math.js operators.js string.js typed.js units.js \
        |
    ( cd "${NPM_DST}" && tar xvf - )

    cd "${NPM_DST}" || exit 1
    npm publish

    echo "end"
)

