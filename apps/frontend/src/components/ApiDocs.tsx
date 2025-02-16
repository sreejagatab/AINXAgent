import React, { useState, useEffect } from 'react';
import { apiDocsGenerator } from '../utils/apiDocs';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { CodeBlock } from './CodeBlock';
import { Tabs } from './Tabs';

interface EndpointProps {
  path: string;
  method: string;
  endpoint: any;
}

const Endpoint: React.FC<EndpointProps> = ({ path, method, endpoint }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="endpoint">
      <div 
        className="endpoint-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`method method-${method.toLowerCase()}`}>
          {method.toUpperCase()}
        </span>
        <span className="path">{path}</span>
        <span className="description">{endpoint.description}</span>
      </div>

      {isExpanded && (
        <div className="endpoint-details">
          {endpoint.parameters && (
            <div className="parameters">
              <h4>Parameters</h4>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>In</th>
                    <th>Required</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.parameters.map(param => (
                    <tr key={param.name}>
                      <td>{param.name}</td>
                      <td>{param.in}</td>
                      <td>{param.required ? 'Yes' : 'No'}</td>
                      <td>{param.schema.type}</td>
                      <td>{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {endpoint.requestBody && (
            <div className="request-body">
              <h4>Request Body</h4>
              <CodeBlock
                code={JSON.stringify(endpoint.requestBody.content['application/json'].schema, null, 2)}
                language="json"
              />
            </div>
          )}

          <div className="responses">
            <h4>Responses</h4>
            <Tabs>
              {Object.entries(endpoint.responses).map(([status, response]) => (
                <Tabs.Tab key={status} label={status}>
                  <CodeBlock
                    code={JSON.stringify(response, null, 2)}
                    language="json"
                  />
                </Tabs.Tab>
              ))}
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export const ApiDocs: React.FC = () => {
  const [docs, setDocs] = useState<any>(null);
  const [format, setFormat] = useState<'json' | 'yaml'>('json');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const exportedDocs = await apiDocsGenerator.exportDocs(format);
        setDocs(format === 'json' ? JSON.parse(exportedDocs) : exportedDocs);
      } catch (error) {
        console.error('Failed to load API docs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocs();
  }, [format]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="api-docs">
      <div className="docs-header">
        <h1>{docs.info.title}</h1>
        <p>{docs.info.description}</p>
        <div className="format-selector">
          <Button
            onClick={() => setFormat('json')}
            variant={format === 'json' ? 'primary' : 'secondary'}
          >
            JSON
          </Button>
          <Button
            onClick={() => setFormat('yaml')}
            variant={format === 'yaml' ? 'primary' : 'secondary'}
          >
            YAML
          </Button>
        </div>
      </div>

      <div className="endpoints">
        {Object.entries(docs.paths).map(([path, methods]: [string, any]) => (
          <div key={path} className="path-group">
            {Object.entries(methods).map(([method, endpoint]: [string, any]) => (
              <Endpoint
                key={`${path}-${method}`}
                path={path}
                method={method}
                endpoint={endpoint}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="schemas">
        <h2>Schemas</h2>
        <Tabs>
          {Object.entries(docs.components.schemas).map(([name, schema]) => (
            <Tabs.Tab key={name} label={name}>
              <CodeBlock
                code={JSON.stringify(schema, null, 2)}
                language="json"
              />
            </Tabs.Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
}; 