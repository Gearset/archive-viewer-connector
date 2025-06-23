#!/bin/bash

# Check if a directory and replacement  are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <directory> <prefix>"
    echo "Prefix might be dev, staging or production"
    exit 1
fi

DIRECTORY="$1"
PREFIX_LOWER=$(echo "$2" | tr '[:upper:]' '[:lower:]')
PREFIX_CAPITALIZED=$(echo "$PREFIX_LOWER" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')

rename_files() {
    local path="$1"
    local pattern="$2"
    
    for file in "$path"/$pattern; do
        if [ -f "$file" ]; then
            dir=$(dirname "$file")
            base=$(basename "$file")
            
            if [[ "$base" == gearset* ]]; then
                new_base="${PREFIX_LOWER}Gearset${base:7}"
            else
                new_base="${PREFIX_CAPITALIZED}${base}"
            fi
            
            mv "$file" "$dir/$new_base"
            echo "Renamed: $file -> $dir/$new_base"
        fi
    done
}

rename_files "$DIRECTORY/classes" "Gearset*"
rename_files "$DIRECTORY/cspTrustedSites" "Gearset*"
rename_files "$DIRECTORY/externalCredentials" "Gearset*"
rename_files "$DIRECTORY/namedCredentials" "Gearset*"
rename_files "$DIRECTORY/lwc/gearsetArchivedRecordsViewer" "gearset*"
rename_files "$DIRECTORY/lwc/gearsetArchiveViewerMessages" "gearset*"
rename_files "$DIRECTORY/permissionsets" "Gearset*"
rename_files "$DIRECTORY/tabs" "gearset*"

mv "$DIRECTORY/lwc/gearsetArchiveViewerMessages" "$DIRECTORY/lwc/${PREFIX_LOWER}GearsetArchiveViewerMessages"
mv "$DIRECTORY/lwc/gearsetArchivedRecordsViewer" "$DIRECTORY/lwc/${PREFIX_LOWER}GearsetArchivedRecordsViewer"

update_text() {
    local file_path="$1"
    local old_text="$2"
    local new_text="$3"
    
    if [ -f "$file_path" ]; then
        awk -v old="$old_text" -v new="$new_text" '{gsub(old, new)}1' "$file_path" > "${file_path}.tmp" && mv "${file_path}.tmp" "$file_path"
        echo "Updated '$old_text' to '$new_text' in: $file_path"
    fi
}

update_text "$DIRECTORY/classes/${PREFIX_CAPITALIZED}GearsetArchiveViewerController.cls" "GearsetArchiveViewerController" "${PREFIX_CAPITALIZED}GearsetArchiveViewerController"
update_text "$DIRECTORY/classes/${PREFIX_CAPITALIZED}GearsetArchiveViewerController.cls" "callout:GearsetArchiveViewer" "callout:${PREFIX_CAPITALIZED}GearsetArchiveViewer"
update_text "$DIRECTORY/classes/${PREFIX_CAPITALIZED}GearsetArchiveViewerController_Test.cls" "GearsetArchiveViewerController" "${PREFIX_CAPITALIZED}GearsetArchiveViewerController"

update_text "$DIRECTORY/externalCredentials/${PREFIX_CAPITALIZED}GearsetArchiveViewer.externalCredential" "Gearset Archive Viewer Principal" "${PREFIX_CAPITALIZED} Gearset Archive Viewer Principal"
update_text "$DIRECTORY/externalCredentials/${PREFIX_CAPITALIZED}GearsetArchiveViewer.externalCredential" "Credential.GearsetArchiveViewer.ApiKey" "Credential.${PREFIX_CAPITALIZED}GearsetArchiveViewer.ApiKey"
update_text "$DIRECTORY/externalCredentials/${PREFIX_CAPITALIZED}GearsetArchiveViewer.externalCredential" "<label>Gearset Archive Viewer</label>" "<label>${PREFIX_CAPITALIZED} Gearset Archive Viewer</label>"

update_text "$DIRECTORY/lwc/${PREFIX_LOWER}GearsetArchivedRecordsViewer/${PREFIX_CAPITALIZED}GearsetArchivedRecordsViewer.js" "GearsetArchivedRecordsViewer" "${PREFIX_CAPITALIZED}GearsetArchivedRecordsViewer"
update_text "$DIRECTORY/lwc/${PREFIX_LOWER}GearsetArchivedRecordsViewer/${PREFIX_CAPITALIZED}GearsetArchivedRecordsViewer.js" "apex/GearsetArchiveViewerController" "apex/${PREFIX_CAPITALIZED}GearsetArchiveViewerController"
update_text "$DIRECTORY/lwc/${PREFIX_LOWER}GearsetArchivedRecordsViewer/${PREFIX_CAPITALIZED}GearsetArchivedRecordsViewer.js" "c/gearsetArchiveViewerMessages" "c/${PREFIX_LOWER}GearsetArchiveViewerMessages"

update_text "$DIRECTORY/lwc/${PREFIX_LOWER}GearsetArchivedRecordsViewer/${PREFIX_CAPITALIZED}GearsetArchivedRecordsViewer.js" "gearsetArchivedRecordsViewerHelper.js" "${PREFIX_LOWER}GearsetArchivedRecordsViewerHelper.js"
update_text "$DIRECTORY/lwc/${PREFIX_LOWER}GearsetArchivedRecordsViewer/${PREFIX_CAPITALIZED}GearsetArchivedRecordsViewer.js" "gearsetArchiveViewer" "${PREFIX_LOWER}GearsetArchiveViewer"
update_text "$DIRECTORY/lwc/${PREFIX_LOWER}GearsetArchivedRecordsViewer/${PREFIX_CAPITALIZED}GearsetArchivedRecordsViewer.js" "c:gearsetArchivedRecordsViewer" "c:${PREFIX_LOWER}GearsetArchivedRecordsViewer"

update_text "$DIRECTORY/namedCredentials/${PREFIX_CAPITALIZED}GearsetArchiveViewer.namedCredential" "GearsetArchiveViewer" "${PREFIX_CAPITALIZED}GearsetArchiveViewer"
update_text "$DIRECTORY/namedCredentials/${PREFIX_CAPITALIZED}GearsetArchiveViewer.namedCredential" "<label>Gearset Archive Viewer</label>" "<label>${PREFIX_CAPITALIZED} Gearset Archive Viewer</label>"

update_text "$DIRECTORY/permissionsets/${PREFIX_CAPITALIZED}GearsetViewArchivedRecords.permissionset" "<label>GearsetViewArchivedRecords</label>" "<label>${PREFIX_CAPITALIZED}GearsetViewArchivedRecords</label>"
update_text "$DIRECTORY/permissionsets/${PREFIX_CAPITALIZED}GearsetViewArchivedRecords.permissionset" "<apexClass>GearsetArchiveViewerController</apexClass>" "<apexClass>${PREFIX_CAPITALIZED}GearsetArchiveViewerController</apexClass>"
update_text "$DIRECTORY/permissionsets/${PREFIX_CAPITALIZED}GearsetViewArchivedRecords.permissionset" "<externalCredentialPrincipal>GearsetArchiveViewer-Gearset Archive Viewer Principal</externalCredentialPrincipal>" "<externalCredentialPrincipal>${PREFIX_CAPITALIZED}GearsetArchiveViewer-${PREFIX_CAPITALIZED} Gearset Archive Viewer Principal</externalCredentialPrincipal>"

update_text "$DIRECTORY/tabs/${PREFIX_LOWER}GearsetArchiveViewer.tab" "<lwcComponent>gearsetArchivedRecordsViewer</lwcComponent>" "<lwcComponent>${PREFIX_LOWER}GearsetArchivedRecordsViewer</lwcComponent>"
update_text "$DIRECTORY/tabs/${PREFIX_LOWER}GearsetArchiveViewer.tab" "<label>Gearset Archive</label>" "<label>${PREFIX_CAPITALIZED} Gearset Archive</label>"

update_text "$DIRECTORY/package.xml" "Gearset" "${PREFIX_CAPITALIZED}Gearset"
update_text "$DIRECTORY/package.xml" "gearset" "${PREFIX_LOWER}Gearset"

echo "Renaming and string replacements complete."