using my.warehouse as my from '../db/data-model';

service CatalogService {
   entity ParkingLot as projection on my.ParkingLot;
   entity AssignedLots as projection on my.AssignedLots;
   entity History as projection on my.History;
   entity Reservations as projection on my.Reservations;
}

@odata.draft.enabled
entity parkinglot as projection on my.ParkingLot actions{
      action parkinglotCreate();
      action parkinglotEdit();
}
 @odata.draft.enabled
 entity AssignedLots as projection on my.AssignedLots;
 @odata.draft.enabled
entity History as projection on my.History;
@odata.draft.enabled
entity Reservations as projection on my.Reservations;
