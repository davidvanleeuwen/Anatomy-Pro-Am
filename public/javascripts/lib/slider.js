
(function() {
    var Event = YAHOO.util.Event,
        Dom   = YAHOO.util.Dom,
        lang  = YAHOO.lang,
        slider, 
        bg="slider-bg", thumb="slider-thumb", 
        valuearea="slider-value", textfield="slider-converted-value"

    // The slider can move 0 pixels up
    var topConstraint = 0;

    // The slider can move 200 pixels down
    var bottomConstraint = 200;

    // Custom scale factor for converting the pixel offset into a real value
    var scaleFactor = 40;

    // The amount the slider moves when the value is changed with the arrow
    // keys
    var keyIncrement = 1;

    var tickSize = 1;

    Event.onDOMReady(function() {

        slider = YAHOO.widget.Slider.getHorizSlider(bg, 
                         thumb, topConstraint, bottomConstraint, 20);

        // Sliders with ticks can be animated without YAHOO.util.Anim
        slider.animate = true;

        slider.getRealValue = function() {
            return Math.round(this.getValue() * scaleFactor);
        }

        slider.subscribe("change", function(offsetFromStart) {

            var valnode = Dom.get(valuearea);
            var fld = Dom.get(textfield);

            // Display the pixel value of the control
            valnode.innerHTML = offsetFromStart;

            // use the scale factor to convert the pixel offset into a real
            // value
            var actualValue = slider.getRealValue();

            // update the text box with the actual value
            fld.value = actualValue;

            // Update the title attribute on the background.  This helps assistive
            // technology to communicate the state change
            Dom.get(bg).title = "slider value = " + actualValue;

        });

        slider.subscribe("slideStart", function() {
                YAHOO.log("slideStart fired", "warn");
            });

        slider.subscribe("slideEnd", function() {
                YAHOO.log("slideEnd fired", "warn");
            });

        // Listen for keystrokes on the form field that displays the
        // control's value.  While not provided by default, having a
        // form field with the slider is a good way to help keep your
        // application accessible.
        Event.on(textfield, "keydown", function(e) {

            // set the value when the 'return' key is detected
            if (Event.getCharCode(e) === 13) {
                var v = parseFloat(this.value, 10);
                v = (lang.isNumber(v)) ? v : 0;

                // convert the real value into a pixel offset
                slider.setValue(Math.round(v/scaleFactor));
            }
        });
        
        // Use setValue to reset the value to white:
        Event.on("putval", "click", function(e) {
            slider.setValue(100, false); //false here means to animate if possible
        });
        
        // Use the "get" method to get the current offset from the slider's start
        // position in pixels.  By applying the scale factor, we can translate this
        // into a "real value
        Event.on("getval", "click", function(e) {
            YAHOO.log("Current value: "   + slider.getValue() + "\n" + 
                      "Converted value: " + slider.getRealValue(), "info", "example"); 
        });
    });
})();
