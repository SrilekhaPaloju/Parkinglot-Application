sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/app/pakinglotfiorielemnt/test/integration/FirstJourney',
		'com/app/pakinglotfiorielemnt/test/integration/pages/ParkingLotList',
		'com/app/pakinglotfiorielemnt/test/integration/pages/ParkingLotObjectPage'
    ],
    function(JourneyRunner, opaJourney, ParkingLotList, ParkingLotObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/app/pakinglotfiorielemnt') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheParkingLotList: ParkingLotList,
					onTheParkingLotObjectPage: ParkingLotObjectPage
                }
            },
            opaJourney.run
        );
    }
);