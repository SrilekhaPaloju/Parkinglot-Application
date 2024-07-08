using CatalogService from '../../srv/cat-service';

annotate CatalogService.ParkingLot with @(UI: {
    SelectionFields       : [
        parkingLotNumber,
        Assignedslots.driverName,
        Assignedslots.vehicleNumber,
        Assignedslots.trasnporTtype
    ],
    HeaderInfo            : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Header',
        TypeNamePlural: 'Assigned Slots',

    },
    Identification        : [{
        $Type : 'UI.DataFieldForAction',
        Action: 'CatalogService.Edit',
        Label : '{i18n>Edit}'
    }],
    LineItem              : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'CatalogService.Edit',
            Label : '{i18n>Edit}'
        },
        {
            Value: parkingLotNumber,
            Label: 'Parking Lot Number'
        },
        {
            Value: Assignedslots.vehicleNumber,
            Label: 'Vehicle Number'
        },
        {
            Value: Assignedslots.driverName,
            Label: 'Assignedslots Name'
        },
        {
            Value: Assignedslots.trasnporTtype,
            Label: 'Transport Type'
        },
        {
            Value: Assignedslots.phoneNumber,
            Label: 'Phone Number'
        },
        {
            Value: Assignedslots.inTime,
            Label: 'In Time'
        },
        {
            Value: Assignedslots.outTime,
            Label: 'Out Time'
        }
    ],
    Facets                : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Parking Lot Information',
            Target: '@UI.FieldGroup#ParkingLot'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Data Visualization',
            Target: '@UI.Identification'
        }
    ],
    FieldGroup #ParkingLot: {Data: [
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
    ]}
});

annotate CatalogService.ParkingLot with @(Capabilities.InsertRestrictions: {Insertable: true});
