var channel = "noset";

function enableSubmit()
{
    var cardNumber = $('#cardNumber');
    var CVV = $("#cvv");
    var confirmButton = $('#confirm-purchase');
    var owner = $('#owner');

    if(owner.val() != "" && CVV.val() != "" && cardNumber.val() != "")
    {
        confirmButton.prop("disabled", false);
    }
    else
    {
        confirmButton.attr('disabled','disabled');
    }   
}

function getChannelCall(extension)
{
        $.get("http://172.21.0.206:88/command?token=az689&cmd=exec&command=core%20show%20channels").done(function (data) {
            //console.log(data);
            resultArray = data.split("\n");
            resultChannelData = resultArray[7].replace(/\s\s+/g, ' ');
            channel = resultChannelData.split(" ")[0];
            //console.log(channel);
        });
}

function generateCall(extension)
{
        $.get("http://cti.pricetravel.com.mx:88/command?cmd=exec&command=channel%20originate%20Local/0449981272880@from-internal-xfer%20application%20MusicOnHold").done(function (data) {
            //console.log(data);
        });

        return "SIP/"+extension;
}

function pausecall(channel)
{
        console.log(channel);
        $.get("http://172.21.0.206:88/command?token=az689&cmd=pauseunpause&channel="+channel).done(function (data) {
            console.log(data);
        });
}

function unpausecall(channel)
{
        console.log(channel);
        $.get("http://172.21.0.23:88/command?token=az689&cmd=pauseunpause&channel="+channel).done(function (data) {
            console.log(data);
        });
}

$(function() {

    generateCall(0449981272880);
    
});
