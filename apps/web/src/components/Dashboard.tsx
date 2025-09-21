import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import VendorTable from "@/components/VendorTable";
import RevenueChart from "@/components/RevenueChart";
import { Download, Wind, DollarSign, BarChart, Zap } from "lucide-react";
import { VENDORS_MOCK_DATA } from "@/data/mockData";

const DashboardContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: clamp(1rem, 5vw, 2rem);
`;

const MaxWidthContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Main = styled.main`
  display: grid;
  gap: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const StatCard = ({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) => (
    <Card>
      <CardHeader style={{ paddingBottom: '0.5rem', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <CardTitle style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94A3B8' }}>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF' }}>{value}</div>
        <p style={{ fontSize: '0.75rem', color: '#64748B' }}>{description}</p>
      </CardContent>
    </Card>
);

const Dashboard = () => {
  const totalMarketCap = VENDORS_MOCK_DATA.reduce((acc, vendor) => acc + vendor.marketCap, 0);
  const averagePERatio = VENDORS_MOCK_DATA.reduce((acc, vendor) => acc + vendor.peRatio, 0) / VENDORS_MOCK_DATA.length;

  const handleExport = () => {
    const headers = Object.keys(VENDORS_MOCK_DATA[0]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...VENDORS_MOCK_DATA.map((vendor) =>
          headers.map(header => vendor[header as keyof typeof vendor]).join(",")
        ),
      ].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "vendor_financial_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardContainer>
      <MaxWidthContainer>
        <Header>
          <HeaderTitle>
            <Wind size={32} color="#38bdf8" />
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em' }}>
                    WindBorne Vendor Health
                </h1>
                <p style={{ color: '#94A3B8' }}>
                    Financial Intelligence Dashboard
                </p>
            </div>
          </HeaderTitle>
          <Button onClick={handleExport} variant="primary">
            <Download size={16} style={{ marginRight: '0.5rem' }} />
            Export Data
          </Button>
        </Header>

        <Main>
          <StatsGrid>
            <StatCard 
              icon={<DollarSign size={16} color="#94A3B8" />}
              title="Total Market Cap"
              value={`$${(totalMarketCap / 1e9).toFixed(2)}B`}
              description="Across all tracked vendors"
            />
            <StatCard 
              icon={<BarChart size={16} color="#94A3B8" />}
              title="Average P/E Ratio"
              value={averagePERatio.toFixed(2)}
              description="A measure of valuation"
            />
             <StatCard 
              icon={<Zap size={16} color="#94A3B8" />}
              title="Top Performer"
              value="Amphenol (APH)"
              description="+8.9% revenue growth"
            />
          </StatsGrid>
        
          <Card>
            <CardHeader>
              <CardTitle>Vendor Financial Overview</CardTitle>
              <CardDescription>
                Key metrics for leading technology vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorTable />
            </CardContent>
          </Card>

          <RevenueChart />
        </Main>
      </MaxWidthContainer>
    </DashboardContainer>
  );
};

export default Dashboard; 