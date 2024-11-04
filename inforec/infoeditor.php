<!DOCTYPE html>
<html>
<body>

<textarea id="textArea" style="width: 800px; height: 500px;">
<?php
    $myfile = fopen("./recorded_info.txt", "r") or die("Unable to open file!");
    $recorded_txt = fread($myfile, filesize("./recorded_info.txt"));
    fclose($myfile);
    echo($recorded_txt);
?>
</textarea>

<br>
<button onclick="save()">Save</button>

<script>
function save() {
    var txt = document.getElementById("textArea").value;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "https://people.compute.dtu.dk/moam/inforec/infoeditor.php?save=true", true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.send("txt=" + txt);
}
</script>

<?php
$is_save = $_GET["save"];
$txt = $_POST['txt'];
if ($is_save == "true") {
    $myfile = fopen("./recorded_info.txt", "w") or die("Unable to open file!");
    fwrite($myfile, $txt);
    fclose($myfile);
}
?>

</body>
</html>
