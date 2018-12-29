'use strict';

var fs = require('fs');
var IBFRecordReader = require('ibf-file-reader/dist/IBFRecord/IBFRecordReader');
var LogRecordParser = require('ibf-file-reader/dist/LogRecord/LogRecordParser');
var LogRecord = require('ibf-file-reader/dist/LogRecord/LogRecord');

function init(env, ctx) {
    var omnipoduploader = {};
  
    omnipoduploader.handleupload = function (req, res, next) {
        console.log("File uploaded:" + req.file.filename);      
        readFile('uploads/' + req.file.filename, function (fileErr, logRecord) {
            if (fileErr) {
                console.log(fileErr);
            } else {
                let treatment = logRecordToTreatment(logRecord);
                if (treatment) {
                    console.log(JSON.stringify(logRecord) + " => " + JSON.stringify(treatment));
                    ctx.treatments.create(treatment, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
        });
        res.status(204).end();
    }
  
    return omnipoduploader;
}

function logRecordToTreatment(obj) {
    if (obj.logType == LogRecord.LogRecordType.HISTORY) {
        var treatment = {
            "created_at": obj.timestamp.toISOString(),
            "enteredBy": "ibf-upload"
        };

        switch(obj.historyLogRecordType) {
            case LogRecord.HistoryLogRecordType.CARB:
                treatment["eventType"] = "Carbs";
                treatment["carbs"] = obj.carbs;
                return treatment;
            case LogRecord.HistoryLogRecordType.BOLUS:
                treatment["eventType"] = "Bolus";
                treatment["insulin"] = obj.units;
                return treatment;
        }
    }

    return null;
}

function readFile(file, callback) {
    fs.readFile(file, (err, buffer) => {
        if (err != null) {
            callback(err);
            return;
        }

        let record;
        while (true) {
            [record, buffer] = IBFRecordReader.readIBFRecord(buffer);

            if (record == null || buffer.length == 0) {
                break;
            }
            let [err, parsed] = LogRecordParser.parseLogRecord(record);
            if (err) {
                callback(err);
            } else if (callback) {
                callback(null, parsed);
            }
        }
    });
}

module.exports = init
