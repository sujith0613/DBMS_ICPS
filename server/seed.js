const mongoose = require('mongoose');
require('dotenv').config();

const PolicyHolder = require('./models/PolicyHolder');
const Branch = require('./models/Branch');
const Event = require('./models/Event');
const Policy = require('./models/Policy');
const ServiceProvider = require('./models/ServiceProvider');
const Claim = require('./models/Claim');
const Surveyor = require('./models/Surveyor');
const ClaimReview = require('./models/ClaimReview');
const Payment = require('./models/Payment');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/icps';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB for seeding');

    // Clear collections
    await Promise.all([
      PolicyHolder.deleteMany(),
      Branch.deleteMany(),
      Event.deleteMany(),
      Policy.deleteMany(),
      ServiceProvider.deleteMany(),
      Claim.deleteMany(),
      Surveyor.deleteMany(),
      ClaimReview.deleteMany(),
      Payment.deleteMany(),
      User.deleteMany()
    ]);

    // 1. Branches
    const branches = [
      { _id: "B101", branch_name: "Chennai Central Branch", location: "Chennai", manager_name: "R. Kumar", contact: "04424567890" },
      { _id: "B102", branch_name: "Bangalore East Branch", location: "Bangalore", manager_name: "S. Rao", contact: "08023456789" },
      { _id: "B103", branch_name: "Mumbai West Branch", location: "Mumbai", manager_name: "A. Singh", contact: "02223456789" }
    ];
    await Branch.insertMany(branches);

    // 2. Events
    const events = [
      { _id: "E101", event_name: "Medical Treatment", event_description: "Hospitalization, surgeries, medical bills", risk_level: "Medium" },
      { _id: "E102", event_name: "Vehicle Accident", event_description: "Road accidents, damage", risk_level: "High" },
      { _id: "E103", event_name: "Fire Damage", event_description: "Fire to property", risk_level: "High" },
      { _id: "E104", event_name: "Natural Disaster", event_description: "Flood, earthquake", risk_level: "Very High" },
      { _id: "E105", event_name: "Life Insurance", event_description: "Death benefit", risk_level: "High" },
      { _id: "E106", event_name: "Theft", event_description: "Theft of insured property", risk_level: "Medium" }
    ];
    await Event.insertMany(events);

    // 3. PolicyHolders
    const policyHolders = [
      { _id: "PH001", name: "Arjun Kumar", dob: new Date("1990-05-12"), gender: "M", aadhaar_no: "4567-8912-3001", phones: ["9876543210"], address: { street: "Anna Nagar", city: "Chennai", state: "Tamil Nadu", pincode: "600040" } },
      { _id: "PH002", name: "Priya Lakshmi", dob: new Date("1985-08-22"), gender: "F", aadhaar_no: "4567-8912-3002", phones: ["9876543211"], address: { street: "Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038" } },
      { _id: "PH003", name: "Rahul Deshmukh", dob: new Date("1992-11-05"), gender: "M", aadhaar_no: "4567-8912-3003", phones: ["9876543212"], address: { street: "Andheri West", city: "Mumbai", state: "Maharashtra", pincode: "400053" } },
      { _id: "PH004", name: "Suresh Raina", dob: new Date("1988-03-15"), gender: "M", aadhaar_no: "4567-8912-3004", phones: ["9876543213"], address: { street: "T Nagar", city: "Chennai", state: "Tamil Nadu", pincode: "600017" } },
      { _id: "PH005", name: "Anjali Menon", dob: new Date("1995-12-30"), gender: "F", aadhaar_no: "4567-8912-3005", phones: ["9876543214"], address: { street: "Koramangala", city: "Bangalore", state: "Karnataka", pincode: "560034" } },
      { _id: "PH006", name: "Vikas Khanna", dob: new Date("1982-06-18"), gender: "M", aadhaar_no: "4567-8912-3006", phones: ["9876543215"], address: { street: "Bandra", city: "Mumbai", state: "Maharashtra", pincode: "400050" } },
      { _id: "PH007", name: "Meena Kumari", dob: new Date("1990-09-12"), gender: "F", aadhaar_no: "4567-8912-3007", phones: ["9876543216"], address: { street: "Adyar", city: "Chennai", state: "Tamil Nadu", pincode: "600020" } },
      { _id: "PH008", name: "Karthik Raja", dob: new Date("1987-01-25"), gender: "M", aadhaar_no: "4567-8912-3008", phones: ["9876543217"], address: { street: "Whitefield", city: "Bangalore", state: "Karnataka", pincode: "560066" } },
      { _id: "PH009", name: "Swati Shah", dob: new Date("1993-04-10"), gender: "F", aadhaar_no: "4567-8912-3009", phones: ["9876543218"], address: { street: "Juhu", city: "Mumbai", state: "Maharashtra", pincode: "400049" } },
      { _id: "PH010", name: "Deepak Chopra", dob: new Date("1980-07-08"), gender: "M", aadhaar_no: "4567-8912-3010", phones: ["9876543219"], address: { street: "Mylapore", city: "Chennai", state: "Tamil Nadu", pincode: "600004" } }
    ];
    await PolicyHolder.insertMany(policyHolders);

    // 4. ServiceProviders
    const providers = [
      { _id: "SP301", provider_name: "Apollo Hospital", provider_type: "Hospital", address: { street: "Greams Road", city: "Chennai", state: "Tamil Nadu", pincode: "600006" }, phone: "04428293333", license_no: "HOSP001", recommended_amount: 115000, remarks: "Premium facility" },
      { _id: "SP302", provider_name: "Fortis Healthcare", provider_type: "Hospital", address: { street: "Bannerghatta Road", city: "Bangalore", state: "Karnataka", pincode: "560076" }, phone: "08066214444", license_no: "HOSP002", recommended_amount: 95000, remarks: "Verified" },
      { _id: "SP303", provider_name: "Maruti Service Center", provider_type: "Garage", address: { street: "Worli", city: "Mumbai", state: "Maharashtra", pincode: "400018" }, phone: "02266554433", license_no: "GAR001", recommended_amount: 45000, remarks: "Authorized" },
      { _id: "SP304", provider_name: "Tata Motors A1", provider_type: "Garage", address: { street: "Guindy", city: "Chennai", state: "Tamil Nadu", pincode: "600032" }, phone: "04422334455", license_no: "GAR002", recommended_amount: 35000, remarks: "Certified" },
      { _id: "SP305", provider_name: "Reliance Restoration", provider_type: "Restoration", address: { street: "HSR Layout", city: "Bangalore", state: "Karnataka", pincode: "560102" }, phone: "08044556677", license_no: "RES001", recommended_amount: 150000, remarks: "Fire damage specialist" },
      { _id: "SP306", provider_name: "Godrej Security Solutions", provider_type: "Inspection", address: { street: "Vikhroli", city: "Mumbai", state: "Maharashtra", pincode: "400079" }, phone: "02225188010", license_no: "INS001", recommended_amount: 25000, remarks: "Theft inspection" },
      { _id: "SP307", provider_name: "Manipal Hospital", provider_type: "Hospital", address: { street: "Old Airport Road", city: "Bangalore", state: "Karnataka", pincode: "560017" }, phone: "08025024444", license_no: "HOSP003", recommended_amount: 80000, remarks: "High volume" },
      { _id: "SP308", provider_name: "Global Fire Safety", provider_type: "Restoration", address: { street: "Lower Parel", city: "Mumbai", state: "Maharashtra", pincode: "400013" }, phone: "02233445566", license_no: "RES002", recommended_amount: 120000, remarks: "Industrial fire" }
    ];
    await ServiceProvider.insertMany(providers);

    // 5. Surveyors
    const surveyors = [
      { _id: "S501", name: "Rajesh Sharma", license_no: "LIC1001", phone: "9001122334" },
      { _id: "S502", name: "Anil Desai", license_no: "LIC1002", phone: "9001122335" },
      { _id: "S503", name: "Priya Singh", license_no: "LIC1003", phone: "9001122336" },
      { _id: "S504", name: "Vikram Seth", license_no: "LIC1004", phone: "9001122337" },
      { _id: "S505", name: "Suman Rao", license_no: "LIC1005", phone: "9001122338" }
    ];
    await Surveyor.insertMany(surveyors);

    // 6. Policies (20 policies)
    const policies = [];
    for (let i = 1; i <= 20; i++) {
        const phIdx = (i - 1) % 10;
        const bIdx = (i - 1) % 3;
        const eIdx = (i - 1) % 6;
        const coverage = 100000 * ((i % 5) + 1);
        const premium = coverage * 0.02;
        
        policies.push({
            _id: `P20${i < 10 ? '0' + i : i}`,
            policy_number: `POL${1000 + i}`,
            premium_amount: premium,
            coverage_amount: coverage,
            start_date: new Date(2023, 0, 1),
            end_date: i > 15 ? new Date(2024, 0, 1) : new Date(2025, 0, 1),
            policy_holder_id: policyHolders[phIdx]._id,
            branch_id: branches[bIdx]._id,
            event_id: events[eIdx]._id
        });
    }
    await Policy.insertMany(policies);

    // 7. Claims (30 claims spanning 12 months)
    const claims = [];
    const statuses = ["Submitted", "Under Review", "Approved", "Rejected"];
    for (let i = 1; i <= 30; i++) {
        const pIdx = (i - 1) % 20;
        const eIdx = (i - 1) % 6;
        const spIdx = (i - 1) % 8;
        
        // Spread claims over the last 12 months
        const claimDate = new Date();
        claimDate.setMonth(claimDate.getMonth() - (i % 12));
        
        let status;
        if (i <= 10) status = "Submitted";
        else if (i <= 18) status = "Under Review";
        else if (i <= 26) status = "Approved";
        else status = "Rejected";

        const hist = [{ status_id: `ST${i}01`, status: "Submitted", status_date: claimDate, updated_by: "System" }];
        if (status !== "Submitted") {
            const reviewDate = new Date(claimDate);
            reviewDate.setDate(reviewDate.getDate() + 2);
            hist.push({ status_id: `ST${i}02`, status: "Under Review", status_date: reviewDate, updated_by: "Surveyor" });
        }
        if (status === "Approved" || status === "Rejected") {
            const finalDate = new Date(claimDate);
            finalDate.setDate(finalDate.getDate() + 5);
            hist.push({ status_id: `ST${i}03`, status: status, status_date: finalDate, updated_by: "Manager" });
        }

        claims.push({
            _id: `C${400 + i}`,
            claim_number: `CLM${5000 + i}`,
            claim_date: claimDate,
            claim_amount: 25000 + (i * 5000),
            claim_status: status,
            event_id: events[eIdx]._id,
            policy_id: policies[pIdx]._id,
            provider_id: providers[spIdx]._id,
            documents: [], // To be added via UI or manual update if needed
            status_history: hist
        });
    }
    await Claim.insertMany(claims);

    // 8. ClaimReviews (for Under Review, Approved, Rejected claims)
    const reviews = [];
    let reviewCounter = 1;
    for (let i = 11; i <= 30; i++) {
        const c = claims[i-1];
        const sIdx = (i - 1) % 5;
        const reviewDate = new Date(c.claim_date);
        reviewDate.setDate(reviewDate.getDate() + 3);
        
        reviews.push({
            _id: `R${600 + reviewCounter}`,
            claim_id: c._id,
            surveyor_id: surveyors[sIdx]._id,
            review_date: reviewDate,
            recommended_amount: Number(c.claim_amount) * 0.9,
            remarks: "Verified damage and associated costs."
        });
        reviewCounter++;
    }
    await ClaimReview.insertMany(reviews);

    // 9. Payments (for Approved claims)
    const payments = [];
    let payCounter = 1;
    for (let i = 1; i <= 30; i++) {
        const c = claims[i-1];
        if (c.claim_status === "Approved" && payCounter <= 8) {
            const payDate = new Date(c.claim_date);
            payDate.setDate(payDate.getDate() + 7);
            
            payments.push({
                _id: `PAY${700 + payCounter}`,
                claim_id: c._id,
                payment_date: payDate,
                payment_amount: Number(c.claim_amount) * 0.9,
                payment_mode: ["Bank Transfer", "NEFT", "RTGS", "Cheque"][payCounter % 4],
                transaction_ref_no: `TXN${900000 + payCounter}`
            });
            payCounter++;
        }
    }
    await Payment.insertMany(payments);

    // 10. Users
    const users = [
      { email: "admin@icps.com", password: "password", role: "admin", reference_id: null },
      { email: "manager@icps.com", password: "password", role: "branch_manager", reference_id: "B101" },
      { email: "arjunkumar@gmail.com", password: "password", role: "policyholder", reference_id: "PH001" },
      { email: "rajesh@icps.com", password: "password", role: "surveyor", reference_id: "S501" },
      { email: "apollo@hospital.com", password: "password", role: "service_provider", reference_id: "SP301" }
    ];
    await User.insertMany(users);

    console.log('Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
