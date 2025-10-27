import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import math

# Create a hierarchical tree structure using Plotly
# Define the hierarchy data
nodes = {
    'Admin Dashboard': {'level': 0, 'x': 0, 'y': 0, 'color': '#1FB8CD'},
    
    # Level 1 - Main modules
    'User Management': {'level': 1, 'x': -3, 'y': 2, 'color': '#DB4545'},
    'Content Moderation': {'level': 1, 'x': -1, 'y': 2, 'color': '#2E8B57'},
    'Payment & Subs': {'level': 1, 'x': 1, 'y': 2, 'color': '#5D878F'},
    'System Controls': {'level': 1, 'x': 3, 'y': 2, 'color': '#D2BA4C'},
    'Comm Center': {'level': 1, 'x': -3, 'y': -2, 'color': '#B4413C'},
    'Data & Backups': {'level': 1, 'x': -1, 'y': -2, 'color': '#964325'},
    'Analytics': {'level': 1, 'x': 1, 'y': -2, 'color': '#944454'},
    'Admin Mgmt': {'level': 1, 'x': 3, 'y': -2, 'color': '#13343B'},
    
    # Level 2 - Sub-features
    'View Users': {'level': 2, 'x': -4, 'y': 3.5, 'color': '#f9f9f9'},
    'Suspend/Ban': {'level': 2, 'x': -3, 'y': 3.5, 'color': '#f9f9f9'},
    'Edit Profiles': {'level': 2, 'x': -2, 'y': 3.5, 'color': '#f9f9f9'},
    
    'Job Queue': {'level': 2, 'x': -1.5, 'y': 3.5, 'color': '#f9f9f9'},
    'Review Queue': {'level': 2, 'x': -0.5, 'y': 3.5, 'color': '#f9f9f9'},
    
    'Transactions': {'level': 2, 'x': 0.5, 'y': 3.5, 'color': '#f9f9f9'},
    'Manage Plans': {'level': 2, 'x': 1.5, 'y': 3.5, 'color': '#f9f9f9'},
    
    'Maintenance': {'level': 2, 'x': 2.5, 'y': 3.5, 'color': '#f9f9f9'},
    'Feature Toggle': {'level': 2, 'x': 3.5, 'y': 3.5, 'color': '#f9f9f9'},
    
    'Email Templates': {'level': 2, 'x': -3.5, 'y': -3.5, 'color': '#f9f9f9'},
    'Broadcast': {'level': 2, 'x': -2.5, 'y': -3.5, 'color': '#f9f9f9'},
    
    'Create Backup': {'level': 2, 'x': -1.5, 'y': -3.5, 'color': '#f9f9f9'},
    'Export Data': {'level': 2, 'x': -0.5, 'y': -3.5, 'color': '#f9f9f9'},
    
    'Real-time Dash': {'level': 2, 'x': 0.5, 'y': -3.5, 'color': '#f9f9f9'},
    'Custom Reports': {'level': 2, 'x': 1.5, 'y': -3.5, 'color': '#f9f9f9'},
    
    'Roles': {'level': 2, 'x': 2.5, 'y': -3.5, 'color': '#f9f9f9'},
    'Audit Logs': {'level': 2, 'x': 3.5, 'y': -3.5, 'color': '#f9f9f9'},
}

# Define connections
connections = [
    ('Admin Dashboard', 'User Management'),
    ('Admin Dashboard', 'Content Moderation'),
    ('Admin Dashboard', 'Payment & Subs'),
    ('Admin Dashboard', 'System Controls'),
    ('Admin Dashboard', 'Comm Center'),
    ('Admin Dashboard', 'Data & Backups'),
    ('Admin Dashboard', 'Analytics'),
    ('Admin Dashboard', 'Admin Mgmt'),
    
    ('User Management', 'View Users'),
    ('User Management', 'Suspend/Ban'),
    ('User Management', 'Edit Profiles'),
    
    ('Content Moderation', 'Job Queue'),
    ('Content Moderation', 'Review Queue'),
    
    ('Payment & Subs', 'Transactions'),
    ('Payment & Subs', 'Manage Plans'),
    
    ('System Controls', 'Maintenance'),
    ('System Controls', 'Feature Toggle'),
    
    ('Comm Center', 'Email Templates'),
    ('Comm Center', 'Broadcast'),
    
    ('Data & Backups', 'Create Backup'),
    ('Data & Backups', 'Export Data'),
    
    ('Analytics', 'Real-time Dash'),
    ('Analytics', 'Custom Reports'),
    
    ('Admin Mgmt', 'Roles'),
    ('Admin Mgmt', 'Audit Logs'),
]

# Create edge traces for connections
edge_x = []
edge_y = []
for connection in connections:
    x0, y0 = nodes[connection[0]]['x'], nodes[connection[0]]['y']
    x1, y1 = nodes[connection[1]]['x'], nodes[connection[1]]['y']
    edge_x.extend([x0, x1, None])
    edge_y.extend([y0, y1, None])

# Create the figure
fig = go.Figure()

# Add edges
fig.add_trace(go.Scatter(
    x=edge_x, y=edge_y,
    line=dict(width=2, color='#cccccc'),
    hoverinfo='none',
    mode='lines',
    showlegend=False
))

# Add nodes for each level
for node_name, props in nodes.items():
    size = 50 if props['level'] == 0 else 35 if props['level'] == 1 else 25
    border_width = 3 if props['level'] == 0 else 2 if props['level'] == 1 else 1
    text_color = 'white' if props['color'] != '#f9f9f9' and props['color'] != '#D2BA4C' else 'black'
    
    fig.add_trace(go.Scatter(
        x=[props['x']],
        y=[props['y']],
        mode='markers+text',
        marker=dict(
            size=size,
            color=props['color'],
            line=dict(width=border_width, color='#333333')
        ),
        text=node_name,
        textposition='middle center',
        textfont=dict(
            size=12 if props['level'] == 0 else 10 if props['level'] == 1 else 8,
            color=text_color
        ),
        hoverinfo='text',
        hovertext=node_name,
        showlegend=False
    ))

# Update layout
fig.update_layout(
    title='Eduhire Admin Dashboard Modules',
    showlegend=False,
    xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    plot_bgcolor='white',
    annotations=[
        dict(
            x=0, y=-4.5,
            text="Admin Dashboard hierarchical structure with main modules and sub-features",
            showarrow=False,
            font=dict(size=10, color='gray')
        )
    ]
)

# Save the chart
fig.write_image('admin_dashboard_org_chart.png')
fig.write_image('admin_dashboard_org_chart.svg', format='svg')
print("Chart saved successfully as admin_dashboard_org_chart.png and admin_dashboard_org_chart.svg")