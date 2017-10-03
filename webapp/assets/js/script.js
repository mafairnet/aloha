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
        $.get("http://172.21.0.206:88/command?token=az689&cmd=exec&command=channel%20originate%20SIP/"+extension+"%20application%20MusicOnHold").done(function (data) {
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
        $.get("http://172.21.0.206:88/command?token=az689&cmd=pauseunpause&channel="+channel).done(function (data) {
            console.log(data);
        });
}

$(function() {

    var owner = $('#owner');
    var cardNumber = $('#cardNumber');
    var cardNumberField = $('#card-number-field');
    var CVV = $("#cvv");
    var mastercard = $("#mastercard");
    var confirmButton = $('#confirm-purchase');
    var visa = $("#visa");
    var amex = $("#amex");

    confirmButton.attr('disabled','disabled');

    $('.payment').hide();

    // Use the payform library to format and validate
    // the payment fields.

    cardNumber.payform('formatCardNumber');
    CVV.payform('formatCardCVC');

    owner.mouseleave(function()
    {
        enableSubmit();
    });

    cardNumber.mouseleave(function()
    {
        enableSubmit();
    });

    CVV.mouseleave(function()
    {
        enableSubmit();
    });

    $('.heading').click(function(){
        $('.heading').hide();
        $('.payment').show();
        getChannelCall();
        pausecall(channel);
    });


    cardNumber.keyup(function() {

        amex.removeClass('transparent');
        visa.removeClass('transparent');
        mastercard.removeClass('transparent');

        if ($.payform.validateCardNumber(cardNumber.val()) == false) {
            cardNumberField.addClass('has-error');
        } else {
            cardNumberField.removeClass('has-error');
            cardNumberField.addClass('has-success');
        }

        if ($.payform.parseCardType(cardNumber.val()) == 'visa') {
            mastercard.addClass('transparent');
            amex.addClass('transparent');
        } else if ($.payform.parseCardType(cardNumber.val()) == 'amex') {
            mastercard.addClass('transparent');
            visa.addClass('transparent');
        } else if ($.payform.parseCardType(cardNumber.val()) == 'mastercard') {
            amex.addClass('transparent');
            visa.addClass('transparent');
        }
    });

    confirmButton.click(function(e) {

        e.preventDefault();

        var isCardValid = $.payform.validateCardNumber(cardNumber.val());
        var isCvvValid = $.payform.validateCardCVC(CVV.val());

        if(owner.val().length < 5){
            alert("Wrong owner name");
        } else if (!isCardValid) {
            alert("Wrong card number");
        } else if (!isCvvValid) {
            alert("Wrong CVV");
        } else {
            // Everything is correct. Add your form submission code here.
            //alert("Everything is correct");
            $('.heading').show();
            $('.payment').hide();
            $('.heading h1').text("Payment correct!");
            unpausecall(channel);
        }
    });

    getChannelCall(generateCall(666));
    
});
