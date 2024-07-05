namespace my.warehouse;

using {cuid} from '@sap/cds/common';

entity ParkingLot {
  key parkingLotNumber : String;
      status           : String;
      Assignedslots    : Association to AssignedLots;
}


entity AssignedLots : cuid {
  driverName    : String;
  phoneNumber   : String;
  vehicleNumber : String;
  inTime        : DateTime;
  outTime       : DateTime;
  trasnporTtype : String;
  assigned      : Boolean;
  parkinglot    : Association to ParkingLot;
}
