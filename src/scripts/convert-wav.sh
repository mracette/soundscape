for dir in ./wav/*/; do
    echo "$dir"
    for file in $dir/*; do
        filename=$(basename $file)
        lame -V1 -q0 $dir$filename  ./vbr/$(basename $dir)/${filename%.*}.mp3
    done
done
