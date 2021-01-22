node ./index.js --no-blobs ../../git/gittest/.git > try1.gv
#dot -Tpng try1.gv -o try1.png
#nomacs try1.png &
dot -Tsvg try1.gv -o try1.svg
inkview try1.svg &
