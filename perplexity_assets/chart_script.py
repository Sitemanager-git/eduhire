import plotly.graph_objects as go
import numpy as np

# Data points provided - using exact months specified
months = [2, 4, 5, 6, 9, 12]  # Month 1-3 average treated as month 2
total_revenue_inr = [2000, 75000, 218000, 430000, 1065000, 2310000]
net_profit_inr = [-3000, 67000, 206000, 415000, 1040000, 2270000]

# Convert to lakhs (1 lakh = 100,000 INR)
total_revenue_lakhs = [x / 100000 for x in total_revenue_inr]
net_profit_lakhs = [x / 100000 for x in net_profit_inr]

# Create interpolated data for all 12 months for smoother projection lines
all_months = list(range(1, 13))
total_revenue_interp = np.interp(all_months, months, total_revenue_lakhs)
net_profit_interp = np.interp(all_months, months, net_profit_lakhs)

# Create the line chart
fig = go.Figure()

# Add Total Revenue line with interpolated data
fig.add_trace(go.Scatter(
    x=all_months,
    y=total_revenue_interp,
    mode='lines',
    name='Total Revenue',
    line=dict(color='#1FB8CD', width=2, dash='dash'),
    hovertemplate='Month %{x}<br>Total Revenue: ₹%{y:.2f}L<extra></extra>'
))

# Add Net Profit line with interpolated data
fig.add_trace(go.Scatter(
    x=all_months,
    y=net_profit_interp,
    mode='lines',
    name='Net Profit',
    line=dict(color='#2E8B57', width=2, dash='dash'),
    hovertemplate='Month %{x}<br>Net Profit: ₹%{y:.2f}L<extra></extra>'
))

# Add actual data points as markers
fig.add_trace(go.Scatter(
    x=months,
    y=total_revenue_lakhs,
    mode='markers',
    name='Revenue Data',
    marker=dict(color='#1FB8CD', size=10, symbol='circle'),
    showlegend=False,
    hovertemplate='Month %{x}<br>Total Revenue: ₹%{y:.2f}L<extra></extra>'
))

fig.add_trace(go.Scatter(
    x=months,
    y=net_profit_lakhs,
    mode='markers',
    name='Profit Data',
    marker=dict(color='#2E8B57', size=10, symbol='circle'),
    showlegend=False,
    hovertemplate='Month %{x}<br>Net Profit: ₹%{y:.2f}L<extra></extra>'
))

# Update layout
fig.update_layout(
    title="Eduhire 12-Month Revenue Projection",
    xaxis_title="Month",
    yaxis_title="Amount (₹ Lakhs)",
    showlegend=True,
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5),
    xaxis=dict(
        showgrid=True, 
        gridwidth=1, 
        gridcolor='lightgray',
        tickmode='linear',
        tick0=1,
        dtick=1,
        range=[1, 12]
    ),
    yaxis=dict(
        showgrid=True, 
        gridwidth=1, 
        gridcolor='lightgray'
    )
)

# Update traces for better visibility
fig.update_traces(cliponaxis=False)

# Save the chart
fig.write_image("revenue_projection.png")
fig.write_image("revenue_projection.svg", format="svg")

print("Updated chart saved successfully!")
print(f"Sample data check - Month 4 Total Revenue: ₹75,000 = {75000/100000} lakhs")
print(f"Sample data check - Month 5 Total Revenue: ₹218,000 = {218000/100000} lakhs")