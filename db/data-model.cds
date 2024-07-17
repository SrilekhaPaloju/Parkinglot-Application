namespace my.warehouse;

using {cuid} from '@sap/cds/common';


entity ParkingLot {
  key parkingLotNumber : String;
      status           : String;
      @UI.Hidden Assignedslots    : Association to AssignedLots;
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

entity History : cuid {
  driverName        : String;
  driverMobile      : String;
  vehicleNumber     : String;
  deliveryType      : String;
  checkInTime       : DateTime;
  checkOutTime      : DateTime;
  historySlotNumber : Association to ParkingLot;

}
 entity Reservations : cuid {
   vendorName :String;
   vehicleNumber :String;
   driverName:String;
   mobileNumber:String;
   processType:String;
   reserveTime :DateTime;
   parkingslot :Association to ParkingLot;
 }



