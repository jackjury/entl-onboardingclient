const photoBtn = document.getElementById("upload_widget");
const photoDiv = document.getElementById("photoDiv");
const nextOfKin = document.getElementById("nextOfKin");

const companySelect = document.getElementById("company");
const emailInput = document.getElementById("email");

const submitBtn = document.getElementById("submit");

// const COMPANY_END_POINT =
//   "https://entl-onboarding.herokuapp.com/api/v1/companies";
// const PEOPLE_END_POINT = "https://entl-onboarding.herokuapp.com/api/v1/people";
// const VALID_EMAIL_END_POINT =
//   "https://entl-onboarding.herokuapp.com/api/v1/validemail";

const COMPANY_END_POINT = "http://localhost:5000/api/v1/companies";
const PEOPLE_END_POINT = "http://localhost:5000/api/v1/people";
const VALID_EMAIL_END_POINT = "http://localhost:5000/api/v1/validemail";

let photourl;

let appData = {
  fieldIsValid: {
    email: false,
    emailIsUnique: false,
    firstName: false,
    lastName: false,
    number: false,
    company: false,
    photo: false,
  },
  validForm: false,
};

let nextOfKinFields = ["Contactname", "Contactnum1", "Contactrel"];

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
      photourl = result.info.url;
      addThumbnail(photourl);
      appData.fieldIsValid.photo = true;
      appData.validForm = isFormValid();
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

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (appData.validForm) {
    const formData = new FormData(signUpForm);
    const data = Object.fromEntries(formData);
    data.image_remote_url = photourl;
    data.company = lookUpID(companySelect.value);
    console.log(data);
    axios
      .post(PEOPLE_END_POINT, data)
      .then(function (response) {
        console.log(response);
        document.getElementById("signUpForm").style.display = "none";
        document.getElementById("successDiv").style.display = "block";
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
    document.getElementById("incompleteForm").style.display = "block";
    window.scrollTo(0, 0);
  }
});

function lookUpID(target) {
  for (let i = 0; i < companiesList.length; i++) {
    const element = companiesList[i];
    if (element.companyName == target) {
      return element.id;
    }
  }
}

let companiesList = [];

async function getCompanies() {
  let response = await fetch(COMPANY_END_POINT);
  let companies = await response.json();
  companiesList = companies;
  companySelect.innerHTML = "";
  let fragment = document.createDocumentFragment();
  let initialOption = document.createElement("option");
  initialOption.innerText = "-- Please Select your Company Below --";
  initialOption.setAttribute("value", "");
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
    nextOfKinFields.forEach((field) => {
      appData.fieldIsValid[field] = false;
    });
  } else {
    nextOfKin.classList.add("hidden");
    nextOfKinFields.forEach((field) => {
      delete appData.fieldIsValid[field];
    });
  }
});

// const phoneJoi = Joi.extend(require("joi-phone-number"));

const schema = {
  Contactname: Joi.string().min(2),
  Contactnum1: Joi.number(),
  Contactrel: Joi.string(),
  email: Joi.string()
    .email({
      minDomainSegments: 3,
    })
    .required(),
  firstName: Joi.string().min(2),
  lastName: Joi.string().min(2),
  number: Joi.number(),
  company: Joi.string(),
};

document.addEventListener("change", (e) => {
  Joi.validate(e.target.value, schema[e.target.id], (error, val) => {
    if (error) {
      console.log(error + val);
      document.getElementById(`${e.target.id}Error`).innerText = error; // Set errors
      appData.fieldIsValid[e.target.id] = false; // Add error to app data
    } else {
      document.getElementById(`${e.target.id}Error`).innerText = ""; // Clear errors

      appData.fieldIsValid[e.target.id] = true; // Add valid to app data
    }
  }); // Validate with joi
  appData.validForm = isFormValid();
  console.log(appData.fieldIsValid);
});

emailInput.addEventListener("change", (e) => {
  setTimeout(() => {
    if (appData.fieldIsValid.email) {
      uniqueEmail(e.target.value.trim().toLowerCase());
    } else {
      document.getElementById("emailInUse").style.display = "none";
    }
  }, 500); // set Timout is hacky workaround to make sure the global eventlistener has validated the input before we check
});

function uniqueEmail(email) {
  let data = {
    email: email,
  };
  axios
    .post(VALID_EMAIL_END_POINT, data)
    .then(function (response) {
      if (!response.data.emailIsValid) {
        document.getElementById("emailInUse").style.display = "block";
        appData.fieldIsValid.emailIsUnique = false;
      } else {
        document.getElementById("emailInUse").style.display = "none";
        appData.fieldIsValid.emailIsUnique = true;
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function isFormValid() {
  for (let field in appData.fieldIsValid) {
    if (!appData.fieldIsValid[field]) {
      return false;
    }
  }
  document.getElementById("incompleteForm").style.display = "none";

  return true;
}
