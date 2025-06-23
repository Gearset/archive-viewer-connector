##############################################################
# Convert the SFDX project into a package
##############################################################
FROM salesforce/cli:2.85.4-full AS convert_package

WORKDIR /app

COPY . /app

# Enable Salesforce replacing environment variables
ENV SF_APPLY_REPLACEMENTS_ON_CONVERT=true

# Install npm packages
RUN npm ci && npm cache clean --force

# Run tests
RUN npm run ci:test

# Run a format check
RUN npm run ci:format-check
RUN npm run ci:eslint
RUN npm run ci:build

# Load the command line arguments and convert the SFDX package
RUN npx dotenvx run -f .env.prod -- sf project convert source --package-name 'GearsetArchiveViewerConnector' --source-dir /app/force-app --output-dir /app/output

# Zip up the outputted package
RUN cd /app/output/ && zip -r /app/archive-viewer-connector.zip .

##############################################################
# Convert the SFDX project into a Nuget package
##############################################################
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

# Copy the output from the previous build stage
COPY --from=convert_package /app/archive-viewer-connector.zip /app/archive-viewer-connector.zip

COPY GearsetArchiveViewerConnector.csproj /app/

ARG build_number=0.0.5
ENV build_number=$build_number

ARG nuget_api_key
ENV NUGET_API_KEY=$nuget_api_key

ARG nuget_source_url
ENV NUGET_SOURCE_URL=$nuget_source_url

# Create the nuget package
RUN dotnet --info && \
    dotnet pack -o /app/artifacts -c Release /p:Version="$build_number" && \
    [ -z "$NUGET_API_KEY" ] || [ -z "$NUGET_SOURCE_URL" ] || dotnet nuget push --source "$NUGET_SOURCE_URL" --api-key "$NUGET_API_KEY" "/app/artifacts/Gearset.ArchiveViewerConnector.$build_number.nupkg"

# Move the SFDX package into the output artifacts
RUN mv /app/archive-viewer-connector.zip /app/artifacts/archive-viewer-connector.zip