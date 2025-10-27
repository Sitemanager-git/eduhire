# Create a simplified flowchart using Plotly shapes and annotations
import plotly.graph_objects as go

fig = go.Figure()

# Define node positions and properties
nodes = [
    {'x': 0.5, 'y': 0.95, 'text': 'Admin Login', 'type': 'process'},
    {'x': 0.5, 'y': 0.85, 'text': 'JWT Auth', 'type': 'process'},
    {'x': 0.5, 'y': 0.75, 'text': '2FA Enabled?', 'type': 'decision'},
    {'x': 0.7, 'y': 0.65, 'text': 'Verify 2FA', 'type': 'process'},
    {'x': 0.5, 'y': 0.55, 'text': 'Verify Role', 'type': 'process'},
    {'x': 0.5, 'y': 0.45, 'text': 'Role Valid?', 'type': 'decision'},
    {'x': 0.5, 'y': 0.35, 'text': 'Load Dashboard', 'type': 'process'},
    {'x': 0.8, 'y': 0.45, 'text': 'Access Denied', 'type': 'error'},
    {'x': 0.5, 'y': 0.25, 'text': 'Admin Action', 'type': 'process'},
    {'x': 0.5, 'y': 0.15, 'text': 'Check Perm', 'type': 'decision'},
    {'x': 0.3, 'y': 0.05, 'text': 'Execute Act', 'type': 'process'},
    {'x': 0.8, 'y': 0.15, 'text': 'Show Error', 'type': 'error'},
    {'x': 0.3, 'y': -0.05, 'text': 'Log Audit', 'type': 'process'},
    {'x': 0.5, 'y': -0.15, 'text': 'Continue Sess', 'type': 'process'},
    {'x': 0.5, 'y': -0.25, 'text': '30 Min TO?', 'type': 'decision'},
    {'x': 0.8, 'y': -0.25, 'text': 'Session Exp', 'type': 'error'}
]

# Color scheme
colors = {
    'process': '#1FB8CD',
    'decision': '#DB4545', 
    'error': '#D2BA4C'
}

# Add shapes for each node
for i, node in enumerate(nodes):
    if node['type'] == 'decision':
        # Diamond for decisions
        fig.add_shape(
            type="path",
            path=f"M {node['x']-0.06},{node['y']} L {node['x']},{node['y']+0.04} L {node['x']+0.06},{node['y']} L {node['x']},{node['y']-0.04} Z",
            fillcolor=colors[node['type']],
            line=dict(color=colors[node['type']], width=2),
            opacity=0.8,
            xref="paper", yref="paper"
        )
    else:
        # Rectangle for processes and errors
        fig.add_shape(
            type="rect",
            x0=node['x']-0.06, y0=node['y']-0.03, 
            x1=node['x']+0.06, y1=node['y']+0.03,
            fillcolor=colors[node['type']],
            line=dict(color=colors[node['type']], width=2),
            opacity=0.8,
            xref="paper", yref="paper"
        )

# Add text labels
for node in nodes:
    fig.add_annotation(
        x=node['x'], y=node['y'],
        text=node['text'],
        showarrow=False,
        font=dict(size=12, color='white', family='Arial Black'),
        xref="paper", yref="paper"
    )

# Add connecting lines
lines = [
    # Main flow
    [(0.5, 0.92), (0.5, 0.88)],  # Login to JWT
    [(0.5, 0.82), (0.5, 0.78)],  # JWT to 2FA check
    [(0.56, 0.75), (0.64, 0.68)],  # 2FA Yes branch
    [(0.7, 0.62), (0.5, 0.58)],  # 2FA to Role verify
    [(0.44, 0.75), (0.5, 0.58)],  # 2FA No branch
    [(0.5, 0.52), (0.5, 0.48)],  # Role verify to check
    [(0.5, 0.42), (0.5, 0.38)],  # Role valid to dashboard
    [(0.56, 0.45), (0.74, 0.45)],  # Role invalid to denied
    [(0.5, 0.32), (0.5, 0.28)],  # Dashboard to action
    [(0.5, 0.22), (0.5, 0.18)],  # Action to check perm
    [(0.44, 0.15), (0.36, 0.08)],  # Perm allowed to execute
    [(0.56, 0.15), (0.74, 0.15)],  # Perm denied to error
    [(0.3, 0.02), (0.3, -0.02)],  # Execute to log
    [(0.3, -0.08), (0.44, -0.15)],  # Log to continue
    [(0.5, -0.18), (0.5, -0.22)],  # Continue to timeout
    [(0.56, -0.25), (0.74, -0.25)],  # Timeout to expired
    # Return flows
    [(0.8, 0.42), (0.56, 0.92)],  # Access denied back to login
    [(0.8, 0.12), (0.5, 0.22)],  # Show error back to action
    [(0.8, -0.28), (0.56, 0.92)],  # Session expired back to login
    [(0.44, -0.25), (0.5, 0.22)]  # No timeout back to action
]

for line in lines:
    fig.add_shape(
        type="line",
        x0=line[0][0], y0=line[0][1],
        x1=line[1][0], y1=line[1][1],
        line=dict(color="#333333", width=2),
        xref="paper", yref="paper"
    )

# Add decision labels
fig.add_annotation(x=0.62, y=0.7, text="Yes", showarrow=False, font=dict(size=10), xref="paper", yref="paper")
fig.add_annotation(x=0.42, y=0.65, text="No", showarrow=False, font=dict(size=10), xref="paper", yref="paper")
fig.add_annotation(x=0.5, y=0.4, text="Yes", showarrow=False, font=dict(size=10), xref="paper", yref="paper")
fig.add_annotation(x=0.65, y=0.45, text="No", showarrow=False, font=dict(size=10), xref="paper", yref="paper")
fig.add_annotation(x=0.38, y=0.12, text="Allow", showarrow=False, font=dict(size=10), xref="paper", yref="paper")
fig.add_annotation(x=0.65, y=0.15, text="Deny", showarrow=False, font=dict(size=10), xref="paper", yref="paper")
fig.add_annotation(x=0.65, y=-0.25, text="Yes", showarrow=False, font=dict(size=10), xref="paper", yref="paper")
fig.add_annotation(x=0.42, y=-0.22, text="No", showarrow=False, font=dict(size=10), xref="paper", yref="paper")

# Update layout
fig.update_layout(
    title="Eduhire Admin Access Control Flow",
    showlegend=False,
    xaxis=dict(visible=False, range=[0, 1]),
    yaxis=dict(visible=False, range=[-0.35, 1]),
    plot_bgcolor='white',
    paper_bgcolor='white'
)

# Save the chart
fig.write_image("admin_access_flow.png")
fig.write_image("admin_access_flow.svg", format="svg")

print("Admin access control flowchart created successfully")