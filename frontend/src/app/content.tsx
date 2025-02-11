"use client";

import { FormDataYAML, MCQ } from "@/data/types";
import { useEffect, useMemo, useState } from "react";

import Loading from "@/components/loading";
import Question from "./question";

export default function Content({
  formData,
}: {
  formData: FormDataYAML | undefined;
}) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<MCQ | undefined>(undefined);
  const [choices, setChoices] = useState<{ [key: string]: boolean }>({});

  const header = useMemo(() => {
    if (question)
      return (
        <>
          <div className="fw-bold pb-2">
            EPA {question.epa}: {formData?.epa_desc[question.epa]}
          </div>
          <div>
            Key Function {question.kf}: {formData?.kf_desc[question.kf]}
          </div>
        </>
      );
    return <></>;
  }, [question]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="row flex-grow-1">
        <div
          className="container px-5 pt-3 text-center"
          style={{ maxWidth: "720px" }}
        >
          {/* Map all questions and choices and display */}
          {loading ? (
   