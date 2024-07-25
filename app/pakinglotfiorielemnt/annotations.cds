using CatalogService from '../../srv/cat-service';

annotate CatalogService.ParkingLot with @(UI: {
    SelectionFields               : [
        parkingLotNumber,
        status,
    ],
    HeaderInfo                    : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Header',
        TypeNamePlural: 'All Slots',
 
    },
    Identification                : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'CatalogService.parkinglotEdit',
            Label : '{i18n>Edit}'
        },
         {
                $Type: 'UI.DataFieldForAction',
                Action:'CatalogService.parkinglotCreate',
                Label: '{i18n>Create}'
            }
    ],
 
    LineItem                      : [
        {
            $Type: 'UI.DataField',
            Value: parkingLotNumber
        },
        {
            $Type: 'UI.DataField',
            Value: status
        }
    ],
    FieldGroup #generalinformation: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                Label: 'Parking Lot Number',
                Value: parkingLotNumber
            },
            {
                Label: 'Status',
                Value: status
            },
        ]
    },
});
 
 
annotate CatalogService.AssignedLots with @(
    UI.FieldGroup #AssignedLots: {Data: [
        {
        Value: parkinglot_parkingLotNumber,
        Label: 'parkingLotNumber'
    },
    {
        Value: driverName,
        Label: 'Driver Name'
    },
    {
        Value: phoneNumber,
        Label: 'Phone Number'
    },
    {
        Value: inTime,
        Label: 'Check-in Time'
    },
    {
        Value: outTime,
        Label: 'Check-out Time'
    },
    {
        Value: trasnporTtype,
        Label: 'Transport Type'
    }
]});
 
annotate CatalogService.ParkingLot with @(UI.Facets: [{
    $Type : 'UI.ReferenceFacet',
    ID    : 'GeneralInformationFacet',
    Label : 'General Information',
    Target: 'Assignedslots/@UI.FieldGroup#AssignedLots'
}]);
 