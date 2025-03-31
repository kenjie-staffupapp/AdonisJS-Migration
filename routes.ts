import StaffupClientController from "#controllers/postgre/staffup_client/staffup_clients_controller";
import StaffupClientConfigController from "#controllers/postgre/staffup_client/staffup_client_config_controller";
import StaffupClientMobileConfigController from "#controllers/postgre/staffup_client/staffup_client_mobile_config_controller";
import StaffupClientOnboardingConfigController from "#controllers/postgre/staffup_client/staffup_client_onboarding_config_controller";
import StaffupClientShiftConfigController from "#controllers/postgre/staffup_client/staffup_client_shift_config_controller";

router
  .group(() => {
    /**
     * StaffupClientController
     * prefix: /staffup
     */

    router
      .group(() => {
        //staffupclient
        router.get("/clients", [StaffupClientController, "getClients"]);
        router.get("/clients/:clientId", [
          StaffupClientController,
          "getClient",
        ]);
        router.post("/staffup_clients", [
          StaffupClientController,
          "createStaffupClient",
        ]);
        router.put("/staffup_clients/:clientId", [
          StaffupClientController,
          "updateStaffupClient",
        ]);
        router.get("/staffup_clients/:clientId", [
          StaffupClientController,
          "getStaffupClient",
        ]);
        router.get("/staffup_clients/configs/:clientId", [
          StaffupClientController,
          "getStaffupClientWithAllConfigs",
        ]);
        //client config
        router.post("/client/config/:clientId", [
          StaffupClientConfigController,
          "createOrUpdateStaffupConfig",
        ]);
        router.get("/staffupalldetails", [
          StaffupClientController,
          "getAllStaffupClientsAndConfigs",
        ]);
        router.get("/client/config/:clientId", [
          StaffupClientConfigController,
          "getStaffupConfigByClientId",
        ]);
        //mobile config
        router.post("/client/mobile/config/:clientId", [
          StaffupClientMobileConfigController,
          "createOrUpdateMobileConfig",
        ]);
        router.get("/client/mobile/config/:clientId", [
          StaffupClientMobileConfigController,
          "getStaffupClientAndMobileConfigById",
        ]);
        //onboarding config
        router.post("/client/onboarding/config/:clientId", [
          StaffupClientOnboardingConfigController,
          "createOrUpdateOnboarding",
        ]);
        router.get("/client/onboarding/config/:clientId", [
          StaffupClientOnboardingConfigController,
          "getStaffupClientAndOnboardingConfigById",
        ]);
        //shift config
        router.post("/client/shift/config/:clientId", [
          StaffupClientShiftConfigController,
          "createOrUpdateShift",
        ]);
        router.get("/client/shift/config/:clientId", [
          StaffupClientShiftConfigController,
          "getStaffupClientAndShiftConfigById",
        ]);
      })
      .prefix("/postgre");
  })
  .prefix("/api/v1");
