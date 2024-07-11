using CatalogService from '../../srv/cat-service';

annotate CatalogService.ParkingLot with @(UI: {
    SelectionFields: [
        parkingLotNumber,
        status,
    ],
    HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Header',
        TypeNamePlural: 'All Slots',

    },
    Identification        : [{
        $Type : 'UI.DataFieldForAction',
        Action: 'CatalogService.Edit',
        Label : '{i18n>Edit}'
    }],
     LineItem         : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'CatalogService.Edit',
            Label : '{i18n>Edit}'
        },
        {
            $Type: 'UI.DataField',
            Value: parkingLotNumber
        },
        {
            $Type: 'UI.DataField',
            Value: status
        }
    ],
    FieldGroup  : {
        $Type : 'UI.FieldGroupType',
        Data :[
             {
            Label: 'Parking Lot Number',
            Value: parkingLotNumber
        },
        {
            Label: 'Vehicle Number',
            Value: Assignedslots.vehicleNumber
        },
        {
            Label: 'Assignedslots Name',
            Value: Assignedslots.driverName
        },
        {
            Label: 'Phone Number',
            Value: Assignedslots.phoneNumber
        },
        {
            Label: 'In Time',
            Value: Assignedslots.inTime
        },
        {
            Label: 'Out Time',
            Value: Assignedslots.outTime
        },
        {
            Label: 'Transport Type',
            Value: Assignedslots.trasnporTtype
        }
        ]
    },
});

annotate CatalogService.ParkingLot with @(
    UI.Facets: [
    {
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneralInformationFacet',
        Label : 'General Information',
        Target: '@UI.FieldGroup'
    }
]);
