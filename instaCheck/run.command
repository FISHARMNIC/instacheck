cd -- "$(dirname "$BASH_SOURCE")"
cd ./final;
echo "ENTER USERNAME AND HIT ENTER"
read usergot
node index $usergot;
echo "CLOSE WHEN DONE"