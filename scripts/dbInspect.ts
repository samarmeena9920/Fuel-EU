import { storage } from '../server/storage';

(async () => {
  try {
    const rows = await storage.getAllShipComplianceByYear(2024);
    console.log('shipCompliance rows for 2024:', rows);

    const banks = await storage.getBankEntries('SHIP002', 2024);
    console.log('bank entries for SHIP002 2024:', banks);

    const routes = await storage.getAllRoutes();
    console.log('routes:', routes);
  } catch (e) {
    console.error('error', e);
  } finally {
    process.exit(0);
  }
})();
