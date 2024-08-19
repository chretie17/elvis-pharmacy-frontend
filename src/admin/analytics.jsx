import React, { useState, useEffect } from 'react';
import { Analytic, Content, Logo, Section } from "../styles/Analytics.styled";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import { IoStatsChart } from "react-icons/io5";
import { BiGroup } from "react-icons/bi";
import { FiActivity } from "react-icons/fi";
import api from '../api'; // Your configured Axios instance

export default function Analytics() {
  const [data, setData] = useState({
    prescriptionsProcessed: 0,
    totalSales: 0,
    newPatients: 0,
    inventoryStatus: 0
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await api.get('/analytics'); // Assuming this is your API endpoint
        setData(response.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <Section>
      <Analytic>
        <Content>
          <h5>Prescriptions Processed</h5>
          <h2>{data.prescriptionsProcessed}</h2>
        </Content>
        <Logo>
          <BsFillCalendar2WeekFill />
        </Logo>
      </Analytic>
      <Analytic>
        <Logo>
          <IoStatsChart />
        </Logo>
        <Content>
          <h5>Total Sales</h5>
          <h2>${data.totalSales}</h2>
        </Content>
      </Analytic>
      <Analytic>
        <Content>
          <h5>New Patients</h5>
          <h2>{data.newPatients}</h2>
        </Content>
        <Logo>
          <BiGroup />
        </Logo>
      </Analytic>
      <Analytic>
        <Logo>
          <FiActivity />
        </Logo>
        <Content>
          <h5>Inventory Status</h5>
          <h2>{data.inventoryStatus} Items</h2>
        </Content>
      </Analytic>
    </Section>
  );
}
