import React, { useState, useEffect, version } from "react";
import { MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";

import LANG_DATA from "./data/LanguagesData.json";
import SECTION_DATA from "./data/SectionsData.json";

import "./styles.css";

export default function Before(props) {
  const [versionOptions, setVersionOptions] = useState([]);

  const [selectedLanguage, setSelectedLanguage] = useState({});
  const [selectedVersion, setSelectedVersion] = useState({});
  const [selectedSection, setSelectedSection] = useState({});

  useEffect(() => {
    // const temp = LANG_DATA.map();
    const previewLang = localStorage.getItem("language");
    setSelectedLanguage({
      language: previewLang,
    });

    if (previewLang) {
      setVersionOptions(
        LANG_DATA.find((one) => one.language == previewLang).translations
      );
    }
    if (localStorage.getItem("version-short")) {
      setSelectedVersion({
        short_name: localStorage.getItem("version-short"),
        full_name: localStorage.getItem("version-full"),
      });
    }
    if (localStorage.getItem("section-value")) {
      setSelectedSection({
        value: localStorage.getItem("section-value"),
        label: localStorage.getItem("section-label"),
      });
    }
  }, []);

  const navigate = useNavigate();
  const onStart = () => {
    navigate(`/main/${selectedVersion.short_name}/${selectedSection.value}`);
  };

  return (
    <div className="before-page h-screen bg-gradient-to-b from-emerald-500 flex flex-col md:flex-row md:gap-40 lg:gap-48 xl:gap-96 md:items-center">
      <MDBTypography className="font-sans font-bold text-white text-center text-2xl  sm:text-3xl py-6 md:w-1/4 xl:text-5xl">
        Please select Language, Version of Bible, Section of Bible.
      </MDBTypography>
      <div className="mt-2 md:w-3/4">
        <div className="mt-1 w-full items-center">
          <div className="font-sans font-bold py-2 md:py-4 text-lg sm:text-xl  xl:mt-12 xl:text-3xl">
            Language:
          </div>
          <Select
            className="mb-1 sm:w-full"
            placeholder={"Enter language..."}
            options={LANG_DATA}
            getOptionLabel={(option) => option.language}
            getOptionValue={(option) => option.language}
            onChange={(e) => {
              setSelectedLanguage(e);
              localStorage.setItem("language", e.language);
              setVersionOptions(e.translations);
              setSelectedVersion({});
            }}
            value={
              localStorage.getItem("language")
                ? selectedLanguage
                : "Please select"
            }
            required
          />
        </div>
        {!selectedLanguage.language && (
          <Alert variant="outlined" color="info" severity="warning">
            Language must be input!
          </Alert>
        )}

        <div className="mt-4 w-full items-center">
          <div className="font-sans font-bold py-2 md:py-4 text-lg sm:text-xl  xl:mt-12 xl:text-3xl">
            Version:
          </div>
          <Select
            className="mb-1 sm:w-full"
            placeholder={"Enter version of Bible..."}
            options={versionOptions}
            getOptionLabel={(option) =>
              option.short_name && `${option.short_name} - ${option.full_name}`
            }
            getOptionValue={(option) => option.short_name}
            value={
              selectedVersion.short_name ? selectedVersion : "Please select"
            }
            onChange={(val) => {
              setSelectedVersion(val);
              localStorage.setItem("version-short", val.short_name);
              localStorage.setItem("version-full", val.full_name);
            }}
            required
          />
        </div>
        {!selectedVersion.short_name && (
          <Alert variant="outlined" color="info" severity="warning">
            Version of Bible must be input!
          </Alert>
        )}

        <div className="mt-4 w-full items-center">
          <div className="font-sans font-bold py-2 text-lg sm:text-xl xl:mt-12 xl:text-3xl">
            Section:
          </div>
          <Select
            className="mb-1 sm:w-full"
            placeholder={"Enter section of Bible..."}
            options={SECTION_DATA}
            getOptionLabel={(option) => option.bible}
            getOptionValue={(option) => option.bible}
            value={
              localStorage.getItem("section-label")
                ? selectedSection
                : "Please select"
            }
            onChange={(val) => {
              setSelectedSection(val);
              localStorage.setItem("section-value", val.value);
              localStorage.setItem("section-label", val.label);
            }}
          />
        </div>
        {!selectedSection.value && (
          <Alert variant="outlined" color="info" severity="warning">
            Section of Bible must be input!
          </Alert>
        )}

        <div className="text-right">
          <MDBBtn
            type="submit"
            className="bg-green-600 mt-3"
            onClick={onStart}
            disabled={
              !(
                selectedLanguage.language &&
                selectedVersion.short_name &&
                selectedSection.value
              )
            }
          >
            Start
          </MDBBtn>
        </div>
      </div>
    </div>
  );
}
