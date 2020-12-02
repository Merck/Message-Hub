# Messaging Hub

## Purpose

Blockchain is an emerging technological paradigm, and in the near term, there's a high likeliehood that companies exploring blockchain will participate in various blockchain ecosystems and consortia. However, connecting an organization's data source systems into multiple blockchain networks will create a significant amount of overhead. 

The Messaging Orchestration HUB will be responsible for providing a connection between an organization's GS1 EPCIS-based track and trace data source system (for example ATTP) and the blockchain networks that require data relevant to product serialization and track & trace. The HUB will be responsible for routing this data in the correct formats to each relevant blockchain network that the organization is participating in. This abstracts and reduces the amount of changes and integrations into the organization's production systems.

The HUB gives each organization the ability to configure data routing and privacy rules through the management UI. For example, an organization can choose to only route certain track and trace events or events containing pre-defined attributes to certain blockchain networks. An organization can also choose whether or not they wish to store data relating to certain events within the HUB itself.

### Overview:

This is a monolithic repo that contains each of the Messaging Hub components as sub-directories. This repo was created using the multi-to-mono-repo script at https://github.com/hraban/tomono

Each sub-directory contains a README.md that details more information on how to run that service. These services were developed with an intention to deploy them on a Kubernetes Istio Service Mesh; however, they can also be ran as individual services in a monolithic structure.
