<!DOCTYPE html>
<html>
<body>

<?php
date_default_timezone_set("Asia/Tehran");

$clr_file = $_GET["clear"];
$source_page = $_GET["source"];
$id = $_GET["id"];
$rec = $_GET["rec"];
if ($rec == "")
    $rec = "true";

if ($clr_file == "true"){
    $myfile = fopen("./recorded_info.txt", "w") or die("Unable to open file!");
    fclose($myfile);
}

# write to the file if rec is true
if ($rec != "false") {
    $txt = date("Y-m-d")." ".date("H:i:s")."\n";
    
    $txt = $txt."page: ".$source_page."\n";
    $txt = $txt."id: ".$id."\n";
    
    $ip = $_SERVER['REMOTE_ADDR'];
    $txt = $txt."ip: ".$ip."\n";

    $url = "https://api.geoapify.com/v1/ipinfo?&ip=".$ip."&apiKey=17e101cbe8714697b109edd9010374a9";
    $curl = curl_init(); 
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $data = curl_exec($curl);

    $data_json = json_decode($data, true);
    $loc = $data_json['continent']['name'];
    $loc = $loc." - ".$data_json['country']['name'];
    $loc = $loc." - ".$data_json['city']['name'];
    $txt = $txt."loc: ".$loc."\n";

    $lat = $data_json['location']['latitude'];
    $long = $data_json['location']['longitude'];
    $txt = $txt."lat: ".$lat." - long: ".$long."\n";
    $txt = $txt."------------------------------\n\n";

    #$data_pretty = json_encode(json_decode($data), JSON_PRETTY_PRINT);
    #$txt = $txt.$data_pretty."\n------------------------------\n\n\n";

    $myfile = fopen("./recorded_info.txt", "a") or die("Unable to open file!");
    fwrite($myfile, $txt);
    fclose($myfile);
}
?> 

</body>
</html>
