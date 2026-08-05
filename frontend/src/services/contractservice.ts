// agricontact/frontend/src/services/contractService.ts

const API_BASE_URL = 'http://localhost:5000/api/contracts';

export interface ContractPayload {
  listingId: string;
  buyerId: string;
  farmerId: string;
  agreedQuantityKg: number;
  agreedPricePerKg: number;
  deliveryDate: string;
}

export const contractService = {
  // 1. Propose a new contract
  async proposeContract(payload: ContractPayload) {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to propose contract');
    }
    return res.json();
  },

  // 2. Fetch all contracts
  async getAllContracts() {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch contracts');
    return res.json();
  },

  // 3. Fetch user-specific contracts
  async getUserContracts(userId: string) {
    const res = await fetch(`${API_BASE_URL}/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user contracts');
    return res.json();
  },

  // 4. Update status (ACCEPTED, REJECTED, COMPLETED, CANCELLED)
  async updateContractStatus(contractId: string, status: string) {
    const res = await fetch(`${API_BASE_URL}/${contractId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update contract status');
    return res.json();
  },
};