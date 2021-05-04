const photoBtn = document.getElementById("upload_widget");
const photoDiv = document.getElementById("photoDiv");
const nextOfKin = document.getElementById("nextOfKin");

const companySelect = document.getElementById("company");

const companyEndPoint =
  "https://entl-onboarding.herokuapp.com/api/v1/companies";

let photourl;

let myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "jackjury",
    uploadPreset: "siteaccess",
    sources: [
      "local",
      "camera",
      "dropbox",
      "google_drive",
      "facebook",
      "instagram",
    ],
    cropping: true,
    croppingAspectRatio: 1.000001,
    minImageWidth: 500,
    minImageHeight: 500,
    croppingShowDimensions: true,
    croppingValidateDimensions: true,
    croppingShowBackButton: true,
    showSkipCropButton: false,
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Done! Here is the image info: ", result.info);
      photourl = result.info.url;
      addThumbnail(photourl);
    }
  }
);

photoBtn.addEventListener(
  "click",
  function () {
    myWidget.open();
  },
  false
);

function addThumbnail(url) {
  photoDiv.innerHTML = "";
  let element = document.createElement("img");
  element.setAttribute("src", url);
  photoDiv.appendChild(element);
}

function sumbitForm() {}

let companiesList = [];

async function getCompanies() {
  let response = await fetch(companyEndPoint);
  let companies = await response.json();
  companiesList = companies;
  companySelect.innerHTML = "";
  let fragment = document.createDocumentFragment();
  let initialOption = document.createElement("option");
  initialOption.innerText = "-- Please Select your Company Below --";
  fragment.appendChild(initialOption);
  companies.forEach((company) => {
    let option = document.createElement("option");
    option.innerText = company.companyName;
    option.setAttribute("value", company.companyName);
    if (company.enhancedData) {
      option.setAttribute("enhancedData", "");
    }
    fragment.appendChild(option);
  });
  companySelect.appendChild(fragment);
}

getCompanies();

companySelect.addEventListener("change", (e) => {
  let hasEnhanced = false;
  companiesList.find((company, index) => {
    if (e.target.value == company.companyName) {
      hasEnhanced = company.enhancedData;
      return;
    }
  });

  if (hasEnhanced) {
    nextOfKin.classList.remove("hidden");
  } else {
    nextOfKin.classList.add("hidden");
  }
});
