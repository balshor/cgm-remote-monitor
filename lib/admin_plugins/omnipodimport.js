'use strict';

var omnipodimport = {
    name: 'omnipodimport'
    , label: 'Import data from an Omnipod PDM file'
    , pluginType: 'admin'
};

function init() {
    return omnipodimport;
}

module.exports = init;

omnipodimport.actions = [{
    name: "Upload carb and bolus entries"
    , description: 'This task will read an Omnipod PDM export file and import the Carb and Bolus entries.'
    , buttonLabel: 'Upload an Omnipod PDM export file.'
    , preventClose: true
  }];

omnipodimport.actions[0].code = function uploadOmnipod(client, callback) {
    var $status = $('#admin_' + omnipodimport.name + '_0_status');

    if (!client.hashauth.isAuthenticated()) {
        alert(translate('Your device is not authenticated yet'));
        if (callback) {
          callback();
        }
        return;
    };

    $status.hide().text('Simulating upload ...').fadeIn('slow');
    
    if (callback) {
        callback();
    }
}
