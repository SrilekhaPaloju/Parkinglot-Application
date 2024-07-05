using CatalogService from '../../srv/cat-service';

// annotate CatalogService.ParkingLot with @(UI: {
//     SelectionFields       : [
//         parkingLotNumber,
//         driver.driveName,
//         driver.vehicleNumber,
//         driver.trasnporTtype
//     ],
//     HeaderInfo            : {
//         $Type         : 'UI.HeaderInfoType',
//         TypeName      : 'Header',
//         TypeNamePlural: 'Assigned Slots',

//     },
//     Identification        : [{
//         $Type : 'UI.DataFieldForAction',
//         Action: 'CatalogService.Edit',
//         Label : '{i18n>Edit}'
//     }],
//     LineItem              : [
//         {
//             $Type : 'UI.DataFieldForAction',
//             Action: 'CatalogService.Edit',
//             Label : '{i18n>Edit}'
//         },
//         {
//             Value: parkingLotNumber,
//             Label: 'Parking Lot Number'
//         },
//         {
//             Value: driver.vehicleNumber,
//             Label: 'Vehicle Number'
//         },
//         {
//             Value: driver.driveName,
//             Label: 'Driver Name'
//         },
//         {
//             Value: driver.trasnporTtype,
//             Label: 'Transport Type'
//         },
//         {
//             Value: driver.phoneNumber,
//             Label: 'Phone Number'
//         },
//         {
//             Value: driver.inTime,
//             Label: 'In Time'
//         },
//         {
//             Value: driver.outTime,
//             Label: 'Out Time'
//         }
//     ],
//     Facets                : [
//         {
//             $Type : 'UI.ReferenceFacet',
//             Label : 'Parking Lot Information',
//             Target: '@UI.FieldGroup#ParkingLot'
//         },
//         {
//             $Type : 'UI.ReferenceFacet',
//             Label : 'Data Visualization',
//             Target: '@UI.Identification'
//         }
//     ],
//     FieldGroup #ParkingLot: {Data: [
//         {
//             Label: 'Parking Lot Number',
//             Value: parkingLotNumber
//         },
//         {
//             Label: 'Vehicle Number',
//             Value: driver.vehicleNumber
//         },
//         {
//             Label: 'Driver Name',
//             Value: driver.driveName
//         },
//         {
//             Label: 'Phone Number',
//             Value: driver.phoneNumber
//         },
//         {
//             Label: 'In Time',
//             Value: driver.inTime
//         },
//         {
//             Label: 'Out Time',
//             Value: driver.outTime
//         },
//         {
//             Label: 'Transport Type',
//             Value: driver.trasnporTtype
//         }
//     ]}
// });

// annotate CatalogService.ParkingLot with @(Capabilities.InsertRestrictions: {Insertable: true});
