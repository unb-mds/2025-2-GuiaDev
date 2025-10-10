import React from "react";
import "./LearningPage.css";

export default function LearningPage() {
  return (
    <div className="learning-wrapper">
      <aside className="sidebar"></aside>

      <main className="main-content">
        <section className="learning-list">
          <div className="learning-item"></div>
          <div className="learning-item"></div>
          <div className="learning-item"></div>
          <div className="learning-item"></div>
          <div className="learning-item"></div>
        </section>

        <aside className="side-panel"></aside>
      </main>
    </div>
  );
}
