using my.warehouse as my from '../db/data-model';

service CatalogService {
   entity ParkingLot as projection on my.ParkingLot;
   entity AssignedLots as projection on my.AssignedLots;
   entity History as projection on my.History;
   entity Reservations as projection on my.Reservations;
}

