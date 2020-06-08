for file in $1/*; do
    filename=$(basename $file)
    echo "$filename"
    lame -V1 -q0 $1$filename  $2${filename%.*}.mp3
done
