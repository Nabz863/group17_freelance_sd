const {
  createContract,
  getContractById,
  updateContractStatus,
  generateFormalContract,
} = require("../services/contractService");
const supabase = require("../utils/supabase");

async function createContractHandler(req, res) {
  try {
    const { projectId, title, freelancerId, contractSections } = req.body;
    const clientId = req.auth.sub;

    const contract = await createContract({
      projectId,
      title,
      clientId,
      freelancerId,
      contractSections,
    });

    const io = req.app.get("io");
    io.to(freelancerId).emit("notification", {
      type: "CONTRACT_CREATED",
      message: `New contract "${contract.title}" awaits your review`,
      contractId: contract.id,
      pdfUrl: contract.pdf_url,
    });

    res.status(201).json({ success: true, contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function listContractsHandler(req, res) {
  try {
    const role = req.user.role;
    const me = req.auth.sub;

    const { data: allContracts, error } = await supabase
      .from("contracts")
      .select("*");
    if (error) throw error;

    let contracts = allContracts;
    if (role === "client") {
      contracts = allContracts.filter((c) => c.client_id === me);
    } else if (role === "freelancer") {
      contracts = allContracts.filter((c) => c.freelancer_id === me);
    }

    res.json({ success: true, contracts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getContractHandler(req, res) {
  try {
    const { contractId } = req.params;
    const contract = await getContractById(contractId);
    if (!contract) return res.status(404).json({ message: "Not found" });

    const role = req.user.role;
    const me = req.auth.sub;
    if (
      role !== "admin" &&
      contract.client_id !== me &&
      contract.freelancer_id !== me
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ success: true, contract });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateContractStatusHandler(req, res) {
  try {
    const { contractId } = req.params;
    const { status } = req.body;
    const role = req.user.role;
    const me = req.auth.sub;

    const contract = await getContractById(contractId);
    if (!contract) return res.status(404).json({ message: "Not found" });

    const isClient = role === "client" && contract.client_id === me;
    const isFreelancer = role === "freelancer" && contract.freelancer_id === me;
    if (!isClient && !isFreelancer && role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (isFreelancer && !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Freelancers can only accept or reject contracts",
      });
    }

    const updated = await updateContractStatus(contractId, status);

    if (isFreelancer && status === "accepted") {
      const { error: projErr } = await supabase
        .from("projects")
        .update({ freelancer_id: contract.freelancer_id })
        .eq("id", contract.project_id);
      if (projErr) {
        console.error("Error assigning freelancer to project:", projErr);
      }
    }

    const io = req.app.get("io");
    const target = isFreelancer ? contract.client_id : contract.freelancer_id;
    io.to(target).emit("notification", {
      type: "CONTRACT_UPDATED",
      message: `Contract "${contract.title}" was ${status}`,
    });

    res.json({ success: true, contract: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function generateDocumentHandler(req, res) {
  try {
    const { contractId } = req.params;
    const role = req.user.role;
    const me = req.auth.sub;

    const contract = await getContractById(contractId);
    if (!contract) return res.status(404).json({ message: "Not found" });

    if (
      role !== "admin" &&
      contract.client_id !== me &&
      contract.freelancer_id !== me
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const document = await generateFormalContract(contractId);
    res.json({ success: true, document });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function downloadContractPdfHandler(req, res) {
  try {
    const { contractId } = req.params;
    const contract = await getContractById(contractId);
    if (!contract || !contract.pdf_url) {
      return res.status(404).send("PDF not found");
    }
    return res.redirect(contract.pdf_url);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

module.exports = {
  createContractHandler,
  listContractsHandler,
  getContractHandler,
  updateContractStatusHandler,
  generateDocumentHandler,
  downloadContractPdfHandler,
};
