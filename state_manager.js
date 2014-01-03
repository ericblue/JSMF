// JSMF - JavaScript State Management Framework
// $Id: state_manager.js,v 1.3 2004-10-04 01:22:50 eblue Exp $ 
//
// Description: JSMF (JavaScript State Management Framework) provides your web-based 
//              applications with a comprehensive mechanism to maintain state.  This 
//              solution is made possible by utilizing frames (standard and inline), 
//              forms, DHTML and an OO (object oriented) JavaScript API.  The API 
//              provides a standardized way to read, write, and persist session data.
//
// Original: Eric T. Blue (erictblue@users.sourceforge.net) This comment should not be removed.
// May be freely used and modified - email notification would be nice

// Must be passed to stateManager()
var initParams = new Object();

// initParams.debug = debug level
initParams.debug = 0;

// initParams.frameType = values = ['iframe','frame']
// default = iframe
initParams.frameType = 'iframe';

// initParams.frame = name of iframe
// default = state_manager
initParams.frame = 'state_manager';

// initParams.type values = ['url','form','hash']
// default = url
initParams.type = 'url';

// Params for type = url
// default = about:blank
initParams.url = 'about:blank';

// Params for type = form
initParams.form = ''

// Params for type = hash
initParams.hashString = ''

// Static methods
function isDefined(o) {

    varToStr=eval("' "+o+"'");
    
    if ( (varToStr==" undefined") || (varToStr==" ") ) {
        return false;
    }
    else {
        return true;
    }

}

function makeHash(string) {
    
    var hash = new Array(); 

    var pairs = string.split(","); 
    
    for ( var i = 0; i < pairs.length; i++ ) {
        var pos = pairs[i].indexOf('='); 
        if ( pos == -1 ) continue;

        var name = pairs[i].substring(0,pos); 
        var value = pairs[i].substring(pos+1);     
        hash[name] = unescape(value);  
    } 
    
    return(hash); 
    
} 

// Constructor
function stateManager(initParams) {
    
    // Properties    
    this._stateFrameName = undefined;
    this._frame = undefined;
    this._frameType = undefined;
    this._form = undefined;

    if ( !isDefined(initParams) ) {
        alert('initialize: no initParams defined!');
        return false;
    }

    if ( !isDefined(initParams.type) ) {
        alert('initialize: no initParams.type defined!');
        return false;
    }

    this._debug = initParams.debug;
    this._stateFrameName = initParams.frame;
    this._frameType = initParams.frameType;
    if (this._frameType == 'iframe') {
         this._frame = window.frames[this._stateFrameName];
    }
    if (this._frameType == 'frame') {
        this._frame = parent.frames[this._stateFrameName];
    }  
    this._initParams = initParams;

    if ( initParams.type == 'url' ) {

        if ( isDefined(initParams.url) ) {
            this._url = initParams.url;
        }

        this._frame.document.location.href = this._url; 

    }

    if ( initParams.type == 'form' ) {

        if ( isDefined(initParams.form) ) {
            this.saveForm(initParams.form);
        }

    }

    if ( initParams.type == 'hash' ) {

        if ( isDefined(initParams.hashString) ) {
            var hash = makeHash(initParams.hashString);
            this.makeForm();
            for ( key in hash ) {
                //alert(hash[key]);
                this.addVariable(key,hash[key]);
            }
        }

    }

    return(1); 
    
}

stateManager.prototype.saveToHash = function() {

    var hashString = '';

    for ( var i = 0; i < this._frame.document.forms[0].elements.length; i++ ) {
        hashString += this._frame.document.forms[0].elements[i].name + ' = ';
        hashString += this._frame.document.forms[0].elements[i].value + ',';
    }

    return(makeHash(hashString));

}

stateManager.prototype.debug = function(debug_flag) {

    if ( isDefined(debug_flag) ) {
        this._debug = debug_flag;
    }

    return(this._debug);

}

stateManager.prototype.peek = function(visibility,height,width) {

    var style_visibility;
    var style_border;

    if ( visibility == 0 ) {
        style_visibility = 'hidden';
        style_border = '0';
    }
    else {
        style_visibility = 'visible';
        style_border = '1';
    }

    var style;
    var frameset_style;

    if (this._frameType == 'iframe') {
        style = document.getElementById('state_manager').style;
    }

    if (this._frameType == 'frame') {
        style = parent.document.getElementById('state_manager').style;
        
        // Todo: Figure out how to resize parent frameset
        //frameset_style = parent.document.getElementById('state_manager_frameset').style;
        //frameset_style.rows = '*,2';
    }


    style.visibility = style_visibility;
    //Todo: Figure out how to set border dynamically
    //style.border = style_border;
    style.height = height + 'px';
    style.width = width + 'px';

}


stateManager.prototype.dump = function() {

    var dumpList = '';
    
    var hash = this.saveToHash();

    for ( key in hash ) {
        dumpList += key + ' = ' + hash[key] + '\n';
    }

    return(dumpList);

}

stateManager.prototype.getVariable = function(name) {
    
    if ( this.debug() ) {
        alert(name + ' = ' + this._frame.document.forms[0].elements[name].value);
    }

    return(this._frame.document.forms[0].elements[name].value);
    
}

stateManager.prototype.setVariable = function(name,value) {
    
    this._frame.document.forms[0].elements[name].value = value;
    if ( this.debug() ) {
        alert(name + ' = ' + this._frame.document.forms[0].elements[name].value);
    }

    return(1);
    
}

stateManager.prototype.addVariable = function(name,value) {

    if ( isDefined(this._frame.document.forms[0].elements[name]) ) {

        if ( this.debug() ) {
            alert('addVarable: name ' + name + ' already exists!');
        }

        return false;
        
    }

    var HTML = '';
    for ( var i = 0; i < this._frame.document.forms[0].elements.length; i++ ) {
        var oName = this._frame.document.forms[0].elements[i].name;
        var oValue = this._frame.document.forms[0].elements[i].value;
        HTML += this.makeFormInput(oName,oValue);
    }
    
    HTML += this.makeFormInput(name,value);

    this.makeForm();
    this._frame.document.forms[0].innerHTML = HTML;

    return(1);

}


stateManager.prototype.deleteVariable = function(name) {

    if ( !isDefined(this._frame.document.forms[0].elements[name]) ) {

        if ( this.debug() ) {
            alert('deleteVarable: name ' + name + ' does not exist!');
        }

        return false;
        
    }

    var HTML = '';
    for ( var i = 0; i < this._frame.document.forms[0].elements.length; i++ ) {
        var oName = this._frame.document.forms[0].elements[i].name;
        var oValue = this._frame.document.forms[0].elements[i].value;
        if ( name != oName ) {
            HTML += this.makeFormInput(oName,oValue);
        }
    }
    
    this.makeForm();
    this._frame.document.forms[0].innerHTML = HTML;

    return(1);

}

stateManager.prototype.makeFormInput = function(name,value) {

    var HTML = '';
    var formType = 'hidden';

    if ( this.debug() ) {
        formType = 'text';
        HTML += name + ' ';
    }

    HTML += '<input type=' + formType + ' name=';
    HTML += name + ' ';
    HTML += 'value=' + value;
    HTML += '><br>'

    return(HTML);

}

stateManager.prototype.makeForm = function() {

    var HTML = '';
    
    HTML += '<html><body><form>';
    HTML += '</form></body></html>';
    
    this._frame.document.open();
    this._frame.document.write(HTML);
    this._frame.document.close();

    if ( this.debug() ) {
        alert('makeForm: SUCCESS');
    }

}

stateManager.prototype.saveForm = function(srcForm) {

    var dumpList = '';
    var HTML = '';
    
    HTML += '<html><body><form>';

    for ( var i = 0; i < srcForm.elements.length; i++ ) {
        HTML += this.makeFormInput(srcForm.elements[i].name,srcForm.elements[i].value);
    }

    HTML += '</form></body></html>';
    
    this._frame.document.open();
    this._frame.document.write(HTML);
    this._frame.document.close();

    if ( this.debug() ) {
        alert('saveForm: SUCCESS');
    }

}

stateManager.prototype.reset = function(url) {
    
    if ( url ) {
        this._url = url;
        this._frame.document.location.href = this._url;
    }
    else {
        this._frame.document.location.href = 'about:blank';
        this.makeForm();
    } 

    return(1);    
    
}

stateManager.prototype.freeze = function(method,parameters) {

    if ( method == 'server' ) {
        var url = parameters;
        this._frame.document.forms[0].action = url;
        this._frame.document.forms[0].method = 'POST';
        this._frame.document.forms[0].submit();
    }

    if ( method == 'client' ) {
        var cookie_name = parameters;
        var pairs = '';

        for ( var i = 0; i < this._frame.document.forms[0].elements.length; i++ ) {
            pairs += this._frame.document.forms[0].elements[i].name + ' = ';
            pairs += this._frame.document.forms[0].elements[i].value + ',';
        }

        document.cookie = cookie_name+'='+escape(pairs)+';path=/;';
        if ( this.debug() ) {
            alert('cookie = ' + document.cookie);
        }

    }

}

stateManager.prototype.thaw = function(method,parameters) {
    
    if ( method == 'server' ) {
        var url = parameters;
        this._frame.document.forms[0].action = url;
        this._frame.document.forms[0].method = 'POST';
        this._frame.document.forms[0].submit();
    }

    if ( method == 'client' ) {
        var cookie = document.cookie.split(';');
        var result = new Array();
        for ( var i=0;i < cookie.length;i++ ) {
            if ( cookie[i].indexOf(name + "=")!=-1 ) {
                result = cookie[i].split("=");
            }
        }

        var hash = makeHash(unescape(result[1]));
        this.makeForm();
        for ( key in hash ) {
            this.addVariable(key,hash[key]);
        }
    }

}    

stateManager.prototype.destroy = function() {
    
    this._frame.document.location.href = 'about:blank';
    this._stateFrameName = undefined; 
    this._frame = undefined; 
    
    return(1);    
    
}

