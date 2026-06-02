export const sriLankanCities = [
  "Colombo", "Kandy", "Galle", "Nuwara Eliya", "Ella", "Mirissa", "Unawatuna",
  "Hikkaduwa", "Bentota", "Negombo", "Anuradhapura", "Polonnaruwa", "Sigiriya",
  "Dambulla", "Trincomalee", "Arugam Bay", "Jaffna", "Batticaloa", "Matara",
  "Hambantota", "Ratnapura", "Badulla", "Kurunegala", "Puttalam", "Kalutara",
  "Gampaha", "Kegalle", "Matale", "Monaragala", "Mannar", "Vavuniya", "Mullaitivu",
  "Kilinochchi", "Ampara"
].sort(); // Sort alphabetically

// Format for react-select
export const cityOptions = sriLankanCities.map(city => ({ value: city, label: city }));