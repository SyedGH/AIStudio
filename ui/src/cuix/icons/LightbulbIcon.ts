/*******************************************************************************
 * CLOUDERA APPLIED MACHINE LEARNING PROTOTYPE (AMP)
 * (C) Cloudera, Inc. 2024
 * All rights reserved.
 *
 * Applicable Open Source License: Apache 2.0
 *
 * NOTE: Cloudera open source products are modular software products
 * made up of hundreds of individual components, each of which was
 * individually copyrighted.  Each Cloudera open source product is a
 * collective work under U.S. Copyright Law. Your license to use the
 * collective work is as provided in your written agreement with
 * Cloudera.  Used apart from the collective work, this file is
 * licensed for your use pursuant to the open source license
 * identified above.
 *
 * This code is provided to you pursuant a written agreement with
 * (i) Cloudera, Inc. or (ii) a third-party authorized to distribute
 * this code. If you do not have a written agreement with Cloudera nor
 * with an authorized and properly licensed third party, you do not
 * have any rights to access nor to use this code.
 *
 * Absent a written agreement with Cloudera, Inc. ("Cloudera") to the
 * contrary, A) CLOUDERA PROVIDES THIS CODE TO YOU WITHOUT WARRANTIES OF ANY
 * KIND; (B) CLOUDERA DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED
 * WARRANTIES WITH RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO
 * IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE; (C) CLOUDERA IS NOT LIABLE TO YOU,
 * AND WILL NOT DEFEND, INDEMNIFY, NOR HOLD YOU HARMLESS FOR ANY CLAIMS
 * ARISING FROM OR RELATED TO THE CODE; AND (D)WITH RESPECT TO YOUR EXERCISE
 * OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, CLOUDERA IS NOT LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR
 * CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO, DAMAGES
 * RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF
 * BUSINESS ADVANTAGE OR UNAVAILABILITY, OR LOSS OR CORRUPTION OF
 * DATA.
 ******************************************************************************/
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LightbulbIcon = (props: any) =>
  /*#__PURE__*/ React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      width: "1em",
      height: "1em",
      className: "cdp-icon-lightbulb",
      ...props,
    },
    /*#__PURE__*/ React.createElement("path", {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M15.056 12.517l.146-.168C16.446 10.906 17 9.73 17 8.538 17 6.037 14.757 4 12 4S7 6.037 7 8.538c0 1.193.554 2.368 1.797 3.81l.147.169.002.002c.344.393.721.824.917 1.48h1.387v-2h1.5v2h1.387c.196-.656.573-1.087.917-1.48l.002-.002zM5 8.537C5 4.934 8.14 2 12 2c3.859 0 7 2.933 7 6.538 0 1.707-.704 3.284-2.281 5.115l-.159.182c-.42.479-.56.64-.56 1.165v1H8v-1c0-.524-.141-.685-.558-1.162l-.003-.003-.159-.183C5.704 11.822 5 10.245 5 8.538zM10.277 21H9.5v-1h5v1h-.777c-.347.596-.985 1-1.723 1a1.992 1.992 0 01-1.723-1zM9 19h6v-2H9v2zm3.914-9c.204 0 .383-.243.475-.451.099-.222.119-.418.109-.55h-2.996c-.01.139.012.343.107.559.094.214.27.442.482.442h1.823zM9.958 8h4.088l.149.163c.419.459.356 1.23.109 1.789-.29.657-.81 1.048-1.39 1.048H11.09c-.588 0-1.11-.39-1.396-1.04-.248-.56-.31-1.333.115-1.797L9.958 8z",
      fill: "currentColor",
    }),
  );

export default LightbulbIcon;
