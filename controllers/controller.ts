import type { HttpContext } from "@adonisjs/core/http";
import db from "@adonisjs/lucid/services/db";

export default class StaffupClientController {
  // Get all Staffup Clients
  async getAllStaffupClients({ response }: HttpContext) {
    try {
      const result = await db.rawQuery(
        "SELECT * FROM staffup_client ORDER BY created_at DESC"
      );
      const clients = result.rows || result;

      return response.status(200).json({ success: true, data: clients });
    } catch (error) {
      console.error("Error fetching staffup clients:", error);
      return response
        .status(500)
        .json({ success: false, error: "Error fetching staffup clients" });
    }
  }
  // Get one client by ID
  async getStaffupClient({ params, response }: HttpContext) {
    try {
      const { clientId } = params;
      const result = await db.rawQuery(
        "SELECT * FROM staffup_client WHERE client_id = ? LIMIT 1",
        [clientId]
      );

      if (!result.rows.length) {
        return response
          .status(404)
          .json({ success: false, error: "Staffup client not found" });
      }

      return response.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Error fetching staffup client:", error);
      return response
        .status(500)
        .json({ success: false, error: "Error fetching staffup client" });
    }
  }
  // create client
  async createStaffupClient({ request, response }: HttpContext) {
    try {
      const body = request.body();

      const clientId = body.client_id ?? null;
      const legacyId = body.legacy_id ?? null;
      const companyName = body.company_name ?? null;
      const companyId = body.company_id ?? null;
      const employerEin = body.employer_ein ?? null;
      const employerName = body.employer_name ?? null;
      const employerAddress = body.employer_address ?? null;
      const addressLine = body.address_line ?? null;
      const countryId = body.country_id ?? null;
      const city = body.city ?? null;
      const zipPostal = body.zip_postal ?? null;
      const createdBy = body.created_by ?? null;

      console.log("Request Body:", body);
      console.log("Bindings:", [
        clientId,
        legacyId,
        companyName,
        companyId,
        employerEin,
        employerName,
        employerAddress,
        addressLine,
        countryId,
        city,
        zipPostal,
        createdBy,
      ]);

      const result = await db.rawQuery(
        `INSERT INTO staffup_client 
        (client_id, legacy_id, company_name, company_id, employer_ein, employer_name, employer_address, 
         address_line, country_id, city, zip_postal, created_by, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING *`,
        [
          clientId,
          legacyId,
          companyName,
          companyId,
          employerEin,
          employerName,
          employerAddress,
          addressLine,
          countryId,
          city,
          zipPostal,
          createdBy,
        ]
      );

      const staffupClient = result.rows[0];
      return response.status(201).json({ success: true, data: staffupClient });
    } catch (error) {
      if (error.code === "23505") {
        return response
          .status(409)
          .json({ success: false, error: "Client ID already exists" });
      }
      console.error("Error creating staffup client:", error);
      return response
        .status(500)
        .json({ success: false, error: "Error creating staffup client" });
    }
  }
  // Update client info
  async updateStaffupClient({ request, response, params }: HttpContext) {
    try {
      const { clientId } = params;

      if (!clientId) {
        return response
          .status(400)
          .json({ success: false, error: "Client ID is required" });
      }

      const {
        legacyId,
        companyName,
        companyId,
        employerEin,
        employerName,
        employerAddress,
        addressLine,
        countryId,
        city,
        zipPostal,
        modifiedBy,
      } = request.body();

      // Validate all required fields
      if (
        companyName === undefined ||
        companyId === undefined ||
        employerEin === undefined ||
        employerName === undefined ||
        employerAddress === undefined ||
        addressLine === undefined ||
        countryId === undefined ||
        city === undefined ||
        zipPostal === undefined ||
        modifiedBy === undefined
      ) {
        return response
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      // Update Query
      const result = await db.rawQuery(
        `UPDATE staffup_client SET 
            legacy_id = ?, company_name = ?, company_id = ?, employer_ein = ?, 
            employer_name = ?, employer_address = ?, address_line = ?, country_id = ?, city = ?, 
            zip_postal = ?, modified_by = ?, updated_at = NOW()
            WHERE client_id = ? RETURNING *`,
        [
          legacyId, // Now included in the update
          companyName,
          companyId,
          employerEin,
          employerName,
          employerAddress,
          addressLine,
          countryId,
          city,
          zipPostal,
          modifiedBy,
          clientId,
        ]
      );

      if (result.rows.length === 0) {
        return response
          .status(404)
          .json({ success: false, error: "Client not found" });
      }

      return response.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Error updating staffup client:", error);
      return response
        .status(500)
        .json({ success: false, error: "Error updating staffup client" });
    }
  }

  // get client all info including config
  async getAllStaffupClientsAndConfigs({ response }: HttpContext) {
    try {
      const result = await db.rawQuery(
        `SELECT c.*, cc.* 
         FROM staffup_client c
         LEFT JOIN staffup_client_config cc ON c.client_id = cc.client_id
         ORDER BY c.created_at DESC`
      );

      // const clients = result.rows || result

      const rows = result.rows || result;

      // result into a nested structure
      const clients = rows.map((row: any) => {
        return {
          clientId: row.client_id,
          companyName: row.company_name,
          legacyId: row.legacy_id,
          companyId: row.company_id,
          employerEin: row.employer_ein,
          employerName: row.employer_name,
          employerAddress: row.employer_address,
          addressLine: row.address_line,
          countryId: row.country_id,
          city: row.city,
          zipPostal: row.zip_postal,
          createdBy: row.created_by,
          modifiedBy: row.modified_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          config: {
            clientConfigId: row.client_config_id,
            firebaseEnv: row.firebase_env,
            twilioNumber: row.twilio_number,
            teamAppleId: row.team_apple_id,
            companyLogo: row.company_logo,
            favIcon: row.fav_icon,
            primaryColor: row.primary_color,
            qrCode: row.qr_code,
            qrCodeLink: row.qr_code_link,
            displayPoweredBy: row.display_powered_by,
            enableClientPortal: row.enable_client_portal,
            createCandidateAts: row.create_candidate_ats,
            synchCandidateAts: row.synch_candidate_ats,
            clientAbbrev: row.client_abbrev,
            mainUserAccount: row.main_user_account,
          },
        };
      });

      return response.status(200).json({ success: true, data: clients });
    } catch (error) {
      console.error("Error fetching client:", error);
      return response
        .status(500)
        .json({ success: false, error: "Error fetching client" });
    }
  }
  // get client info and all of config info
  async getStaffupClientWithAllConfigs({ params, response }: HttpContext) {
    try {
      const { clientId } = params;

      if (!clientId) {
        return response
          .status(400)
          .json({ success: false, error: "Missing client ID in URL" });
      }

      const result = await db.rawQuery(
        `SELECT 
          c.*, 
          cc.*, 
          cmc.*, 
          coc.*, 
          csc.* 
        FROM staffup_client c
        LEFT JOIN staffup_client_config cc ON c.client_id = cc.client_id
        LEFT JOIN staffup_client_mobile_config cmc ON c.client_id = cmc.client_id
        LEFT JOIN staffup_client_onboarding_config coc ON c.client_id = coc.client_id
        LEFT JOIN staffup_client_shift_config csc ON c.client_id = csc.client_id
        WHERE c.client_id = ?
        ORDER BY c.created_at DESC`,
        [clientId]
      );

      if (!result.rows.length) {
        return response
          .status(404)
          .json({ success: false, error: "Client not found" });
      }

      return response.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error("Error fetching client data:", error);
      return response
        .status(500)
        .json({ success: false, error: "Error fetching client data" });
    }
  }
  async getClients({ request, response }: HttpContext) {
    try {
      const { limit, page, sortBy, sortOrder, ...queryParams } = request.qs();

      // Validate limit and page
      const pageInt = Number.parseInt(page) || 1;
      const limitInt = Number.parseInt(limit) || 10;
      const offset = (pageInt - 1) * limitInt;

      let query = `
            SELECT sc.*,
                scc.*,
                scmc.*,
                scomc.*,
                scsc.*
            FROM staffup_client sc
            LEFT JOIN staffup_client_config scc ON sc.client_id = scc.client_id
            LEFT JOIN staffup_client_mobile_config scmc ON sc.client_id = scmc.client_id
            LEFT JOIN staffup_client_onboarding_config scomc ON sc.client_id = scomc.client_id
            LEFT JOIN staffup_client_shift_config scsc ON sc.client_id = scsc.client_id
            WHERE 1=1`;

      const queryParamsArray = [];

      // Dynamic filters
      for (const key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
          query += ` AND sc.${key} ILIKE ?`;
          queryParamsArray.push(`%${queryParams[key]}%`);
        }
      }

      // Sorting
      if (sortBy && sortOrder) {
        query += ` ORDER BY sc.${sortBy} ${sortOrder.toUpperCase()}`;
      }

      // Add LIMIT and OFFSET
      query += ` LIMIT ? OFFSET ?`;
      queryParamsArray.push(limitInt, offset);

      // Execute query
      const result = await db.rawQuery(query, queryParamsArray);
      const clients = result.rows;

      // Get total count
      const totalClients = await db.rawQuery(
        "SELECT COUNT(*) FROM staffup_client"
      );
      const totalCount = Number.parseInt(totalClients.rows[0].count);
      const totalPages = Math.ceil(totalCount / limitInt);
      const hasNextPage = pageInt < totalPages;

      return response.status(200).json({
        success: true,
        hasMore: hasNextPage,
        count: totalCount,
        pages: totalPages,
        data: clients,
        meta: {
          totalItems: totalCount,
          totalPages: totalPages,
          currentPage: pageInt,
          itemsPerPage: limitInt,
        },
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      return response
        .status(500)
        .json({ success: false, error: "Error fetching clients" });
    }
  }
  async getClient({ request, response, params }: HttpContext) {
    try {
      const { clientId } = params; // Ensure clientid is extracted correctly
      if (!clientId) {
        return response
          .status(400)
          .json({ success: false, error: "Client ID is required" });
      }

      const { limit, page, sortBy, sortOrder, ...queryParams } = request.qs();

      // Validate limit and page
      const pageInt = Number.parseInt(page) || 1;
      const limitInt = Number.parseInt(limit) || 10;
      const offset = (pageInt - 1) * limitInt;

      let query = `
            SELECT sc.*, 
                scc.*, 
                scmc.*, 
                scomc.*, 
                scsc.*
            FROM staffup_client sc
            LEFT JOIN staffup_client_config scc ON sc.client_id = scc.client_id
            LEFT JOIN staffup_client_mobile_config scmc ON sc.client_id = scmc.client_id
            LEFT JOIN staffup_client_onboarding_config scomc ON sc.client_id = scomc.client_id
            LEFT JOIN staffup_client_shift_config scsc ON sc.client_id = scsc.client_id
            WHERE sc.client_id = ?`;

      const queryParamsArray = [clientId]; // Ensure clientid is added to the array

      // Dynamic filters
      for (const key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
          query += ` AND sc.${key} ILIKE ?`;
          queryParamsArray.push(`%${queryParams[key]}%`);
        }
      }

      // Sorting
      if (sortBy && sortOrder) {
        query += ` ORDER BY sc.${sortBy} ${sortOrder.toUpperCase()}`;
      }

      // Add LIMIT and OFFSET
      query += ` LIMIT ? OFFSET ?`;
      queryParamsArray.push(limitInt, offset);

      // Execute query
      const result = await db.rawQuery(query, queryParamsArray);
      const clients = result.rows;

      // Get total count for the client
      const totalClients = await db.rawQuery(
        "SELECT COUNT(*) FROM staffup_client WHERE client_id = ?",
        [clientId]
      );
      const totalCount = Number.parseInt(totalClients.rows[0].count);
      const totalPages = Math.ceil(totalCount / limitInt);
      const hasNextPage = pageInt < totalPages;

      const nextPage = hasNextPage
        ? `/postgre/clients/${clientId}?limit=${limit}&page=${
            pageInt + 1
          }&sortBy=${sortBy}&sortOrder=${sortOrder}`
        : null;

      return response.status(200).json({
        success: true,
        hasMore: hasNextPage,
        count: totalCount,
        pages: totalPages,
        data: clients,
        meta: {
          totalItems: totalCount,
          totalPages: totalPages,
          currentPage: pageInt,
          itemsPerPage: limitInt,
        },
        next: nextPage, // Add the nextPage link
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      return response
        .status(500)
        .json({ success: false, error: "Error fetching clients" });
    }
  }
}
